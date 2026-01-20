"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/supabase/client";
import { analytics } from "@/lib/analytics/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, agencyName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error && data.user) {
        analytics.track("User Signed In", {
          userId: data.user.id,
          email: data.user.email,
        });
        analytics.identify(data.user.id, {
          email: data.user.email,
        });
      }
      
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, agencyName: string) => {
    try {
      let baseSlug = agencyName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      
      // Create user with agency name in metadata (for trigger to use)
      // Enable email confirmation - Supabase will send verification email
      const redirectUrl = typeof window !== "undefined" 
        ? `${window.location.origin}/auth/callback`
        : process.env.NEXT_PUBLIC_APP_URL 
          ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
          : "/auth/callback";

      const { data, error: authError } = await supabase.auth.signUp({ 
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            agency_name: agencyName,
            agency_slug: baseSlug,
          },
        },
      });

      if (authError) {
        // Log the full error for debugging
        console.error("Signup auth error:", {
          message: authError.message,
          status: authError.status,
          code: authError.code,
          fullError: authError
        });
        
        // Check for specific error codes and messages
        const errorMessage = authError.message?.toLowerCase() || '';
        const errorCode = authError.status || authError.code || '';
        const supabaseErrorCode = authError.code || '';
        
        // Handle "user already registered" error
        // This happens when email exists in auth.users (even if unconfirmed)
        if (
          errorCode === 422 || 
          supabaseErrorCode === 'user_already_exists' ||
          errorMessage.includes('user already registered') ||
          errorMessage.includes('email already registered') ||
          errorMessage.includes('already exists')
        ) {
          // Try to sign in with the email to check if account exists and is confirmed
          // If it's unconfirmed, we can't do much - user needs to delete from Supabase Dashboard
          return { 
            error: new Error(
              'This email is already registered. If you haven\'t confirmed your email, please delete the account from Supabase Dashboard (Authentication > Users) or use a different email address. Otherwise, please sign in.'
            ) 
          };
        }
        
        // For other errors, return a more user-friendly message
        return { 
          error: new Error(
            authError.message || 'Failed to create account. Please try again.'
          ) 
        };
      }

      if (!data.user) {
        return { error: new Error("User creation failed") };
      }

      // Track signup
      analytics.track("User Signed Up", {
        userId: data.user.id,
        email: data.user.email,
        agencyName,
      });
      analytics.identify(data.user.id, {
        email: data.user.email,
        agencyName,
      });

      // Make slug unique by appending user ID suffix
      const uniqueSlug = `${baseSlug}-${data.user.id.substring(0, 8)}`;

      // Try to create agency directly (works if email confirmation is disabled)
      // The trigger will also try to create it, but we check for duplicates first
      const { error: agencyError } = await supabase.from("agencies").insert({
        name: agencyName,
        slug: uniqueSlug,
        email: email,
        niche: "Web3",
        verified: false,
        user_id: data.user.id,
      });

      // If RLS fails, the trigger will handle it (it also checks for duplicates)
      if (agencyError) {
        if (agencyError.message?.includes('row-level security')) {
          // Trigger will handle it - don't error
          console.log("Agency creation will be handled by trigger");
        } else if (agencyError.message?.includes('duplicate') || agencyError.message?.includes('already exists')) {
          // Agency already exists (maybe trigger created it)
          // Check again to confirm
          const { data: checkAgency } = await supabase
            .from("agencies")
            .select("id")
            .eq("user_id", data.user.id)
            .maybeSingle();
          
          if (!checkAgency) {
            // Still doesn't exist, might be slug conflict
            const timestampSlug = `${baseSlug}-${Date.now().toString().slice(-6)}`;
            const { error: timestampError } = await supabase.from("agencies").insert({
              name: agencyName,
              slug: timestampSlug,
              email: email,
              niche: "Web3",
              verified: false,
              user_id: data.user.id,
            });
            
            if (timestampError && !timestampError.message?.includes('row-level security')) {
              return { error: timestampError };
            }
          }
          // If checkAgency exists, trigger already created it - that's fine
        } else {
          // Other error - return it
          return { error: agencyError };
        }
      }

      // Send welcome email (non-blocking)
      if (data.user && email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "https://crewdeck.xyz");
        const dashboardUrl = `${baseUrl}/dashboard/agency`;
        
        // Use dynamic import to make this non-blocking
        import("@/lib/email/utils").then(({ sendWelcomeEmail }) => {
          sendWelcomeEmail(email, agencyName, dashboardUrl).catch((err) => {
            console.error("Failed to send welcome email:", err);
            // Don't block signup if email fails
          });
        });
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    if (user) {
      analytics.track("User Signed Out", {
        userId: user.id,
      });
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/supabase/client";
import { analytics } from "@/lib/analytics/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, profileName: string, profileType: "agency" | "kol") => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    let mounted = true;
    let refreshTimeout: NodeJS.Timeout | null = null;
    let lastRefreshTime = 0;
    const MIN_REFRESH_INTERVAL = 5000; // 5 seconds minimum between refreshes

    // Get initial session with rate limiting protection
    const getSession = async () => {
      const now = Date.now();
      if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
        // Too soon, wait
        refreshTimeout = setTimeout(() => {
          if (mounted) getSession();
        }, MIN_REFRESH_INTERVAL - (now - lastRefreshTime));
        return;
      }

      lastRefreshTime = now;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Handle 429 rate limit errors gracefully
          if (error.message?.includes('429') || error.status === 429) {
            console.warn("Rate limited on session refresh, will retry after delay");
            // Exponential backoff for 429 errors
            const backoffDelay = Math.min(10000, 2000 * Math.pow(2, 0));
            refreshTimeout = setTimeout(() => {
              if (mounted) {
                lastRefreshTime = 0; // Reset to allow retry
                getSession();
              }
            }, backoffDelay);
            return;
          }
        }
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error getting session:", err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes with aggressive debouncing
    let lastEventTime = 0;
    const DEBOUNCE_INTERVAL = 1000; // 1 second minimum between events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Aggressive debouncing to prevent excessive refreshes
      const now = Date.now();
      if (now - lastEventTime < DEBOUNCE_INTERVAL && event !== 'SIGNED_OUT') {
        return; // Skip if too soon after last event
      }
      lastEventTime = now;

      // Only update if session actually changed
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (refreshTimeout) clearTimeout(refreshTimeout);
      subscription.unsubscribe();
    };
  }, []);

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

  const signUp = async (email: string, password: string, profileName: string, profileType: "agency" | "kol") => {
    try {
      let baseSlug = profileName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      
      // Create user with profile data in metadata (for trigger to use)
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
            profile_name: profileName,
            profile_slug: baseSlug,
            profile_type: profileType,
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

      // Check if user was created (even if email confirmation is required)
      if (!data.user) {
        return { error: new Error("User creation failed. Please try again.") };
      }

      // User was created successfully - continue with profile creation
      // Don't fail if profile creation has issues - trigger will handle it

      // Track signup
      analytics.track("User Signed Up", {
        userId: data.user.id,
        email: data.user.email,
        profileName,
        profileType,
      });
      analytics.identify(data.user.id, {
        email: data.user.email,
        profileName,
        profileType,
      });

      // Make slug unique by appending user ID suffix
      const uniqueSlug = `${baseSlug}-${data.user.id.substring(0, 8)}`;

      // The trigger will create the profile automatically from user metadata
      // Run profile creation check asynchronously - don't block signup
      // This ensures signup succeeds even if profile creation is delayed
      (async () => {
        try {
          // Wait a moment for trigger to execute
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if profile was created by trigger
          const { data: checkProfile, error: checkError } = await supabase
            .from("profiles")
            .select("id, name, profile_type")
            .eq("user_id", data.user.id)
            .maybeSingle();
          
          if (checkError && checkError.code !== 'PGRST116') {
            console.error("Error checking profile after signup:", checkError);
          }
          
          if (!checkProfile) {
            // Profile not created yet - trigger might be delayed or RLS blocked it
            // Try to create it manually as fallback (only if RLS allows)
            const { error: profileError } = await supabase.from("profiles").insert({
              name: profileName,
              slug: uniqueSlug,
              email: email,
              profile_type: profileType,
              niche: "Web3",
              verified: false,
              user_id: data.user.id,
            });

            if (profileError) {
              // If RLS blocks it, that's okay - trigger will handle it
              if (profileError.message?.includes('row-level security') || profileError.code === '42501') {
                console.log("Profile creation blocked by RLS - trigger will handle it");
              } else if (profileError.message?.includes('duplicate') || profileError.message?.includes('already exists')) {
                console.log("Profile already exists - trigger created it");
              } else {
                console.error("Profile creation error (non-fatal, trigger should handle it):", profileError);
              }
            } else {
              console.log("Profile created successfully manually");
            }
          } else {
            console.log("Profile created successfully by trigger");
          }
        } catch (err) {
          console.error("Error in profile creation check (non-fatal):", err);
          // Don't fail signup - trigger should handle it
        }
      })(); // Run async, don't await
      
      // Signup succeeded immediately - profile will be created by trigger

      // Send welcome email (non-blocking)
      if (data.user && email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "https://crewdeck.xyz");
        // Use profile type to determine dashboard URL
        const dashboardPath = profileType === "kol" ? "/dashboard/kol" : "/dashboard/agency";
        const dashboardUrl = `${baseUrl}${dashboardPath}`;
        
        // Use dynamic import to make this non-blocking
        import("@/lib/email/utils").then(({ sendWelcomeEmail }) => {
          sendWelcomeEmail(email, profileName, dashboardUrl).catch((err) => {
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

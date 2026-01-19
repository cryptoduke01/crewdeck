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
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            agency_name: agencyName,
            agency_slug: baseSlug,
          },
        },
      });

      if (authError) {
        // Better error message for existing users
        if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
          return { 
            error: new Error(
              'This email is already registered. Please sign in instead, or delete the user from Supabase Auth (Authentication > Users) if you want to recreate the account.'
            ) 
          };
        }
        return { error: authError };
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

      // Make slug unique by appending user ID suffix if needed
      const uniqueSlug = `${baseSlug}-${data.user.id.substring(0, 8)}`;

      // Try to create agency directly (works if email confirmation is disabled)
      const { error: agencyError } = await supabase.from("agencies").insert({
        name: agencyName,
        slug: uniqueSlug,
        email: email,
        niche: "Web3",
        verified: false,
        user_id: data.user.id,
      });

      // If RLS fails, wait a bit and try again (user might be authenticated now)
      // Or the trigger will handle it
      if (agencyError) {
        if (agencyError.message?.includes('row-level security') || agencyError.message?.includes('duplicate')) {
          // Wait 1 second and try again (in case user got authenticated)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try with unique slug
          const { error: retryError } = await supabase.from("agencies").insert({
            name: agencyName,
            slug: uniqueSlug,
            email: email,
            niche: "Web3",
            verified: false,
            user_id: data.user.id,
          });

          if (retryError && !retryError.message?.includes('duplicate')) {
            // If still fails (and not duplicate), trigger should handle it
            console.warn("Agency creation failed, trigger should handle it:", retryError);
            // Don't return error - trigger will create it
          }
        } else if (agencyError.message?.includes('duplicate')) {
          // Slug conflict - try with timestamp
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
        } else {
          // Other error - return it
          return { error: agencyError };
        }
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

"use client";

import { useState, useEffect, useRef } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/context";
import { Agency } from "@/hooks/use-agency";

// Global cache to prevent duplicate fetches
let profileCache: {
  userId: string | null;
  data: Agency | null;
  timestamp: number;
} = {
  userId: null,
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 30000; // 30 seconds cache

export function useMyAgency() {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let fetchTimeout: NodeJS.Timeout | null = null;
    let isFetching = false;

    async function fetchMyAgency() {
      if (!user) {
        if (isMounted) {
          setAgency(null);
          setLoading(false);
        }
        return;
      }

      // Check cache first
      const now = Date.now();
      if (
        profileCache.userId === user.id &&
        profileCache.data &&
        (now - profileCache.timestamp) < CACHE_DURATION
      ) {
        if (isMounted) {
          setAgency(profileCache.data);
          setLoading(false);
        }
        return;
      }

      // Prevent multiple simultaneous fetches
      if (isFetching) {
        // If we have cached data, use it while waiting
        if (profileCache.userId === user.id && profileCache.data) {
          if (isMounted) {
            setAgency(profileCache.data);
            setLoading(false);
          }
        }
        return;
      }

      try {
        isFetching = true;
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        const supabase = createSupabaseClient();

        // Fetch profile by user_id
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        
        // Check if component is still mounted
        if (!isMounted) return;

        // Log for debugging
        if (profileError) {
          // If it's a "no rows" error, that's okay - user just doesn't have a profile yet
          if (profileError.code === 'PGRST116' || profileError.message?.includes('No rows')) {
            // This is expected - user doesn't have a profile yet
            if (isMounted) {
              setAgency(null);
              setLoading(false);
            }
            return;
          }
          // For other errors, log and throw
          console.error("Error fetching profile:", {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint,
            fullError: profileError
          });
          throw profileError;
        }

        // Also log what we found
        if (profileData) {
          console.log("Found profile:", profileData.name, "user_id:", profileData.user_id, "current user:", user.id);
        } else {
          console.log("No profile found for user:", user.id);
        }

        if (!isMounted) return;

        if (profileData) {
          // Fetch services (only for agencies, KOLs don't have services)
          let services: string[] = [];
          if (profileData.profile_type !== "kol") {
            try {
              const { data: servicesData, error: servicesError } = await supabase
                .from("services")
                .select("name")
                .eq("profile_id", profileData.id);
              
              if (!isMounted) return;

            if (servicesError) {
              // If column doesn't exist yet, services will be empty
              console.warn("Error fetching services (may need migration):", servicesError);
            } else {
              services = servicesData?.map((s: any) => s.name) || [];
            }
          } catch (err) {
            // Silently fail - services table might not be migrated yet
            console.warn("Services query failed (may need migration):", err);
          }
        }

          const transformedProfile: Agency = {
            id: profileData.id,
            name: profileData.name,
            slug: profileData.slug,
            profile_type: profileData.profile_type || "agency",
            niche: profileData.niche,
            rating: parseFloat(profileData.rating) || 0,
            reviews: profileData.review_count || 0,
            location: profileData.location || "Remote",
            services: services,
            priceRange: profileData.price_range_min && profileData.price_range_max
              ? `$${profileData.price_range_min.toLocaleString()} - $${profileData.price_range_max.toLocaleString()}`
              : "Contact for pricing",
            priceRangeMin: profileData.price_range_min,
            priceRangeMax: profileData.price_range_max,
            verified: profileData.verified || false,
            description: profileData.description,
            website: profileData.website,
            email: profileData.email,
            founded: profileData.founded,
            team_size: profileData.team_size,
            solana_wallet: profileData.solana_wallet,
            wallet_verified: profileData.wallet_verified || false,
            // KOL-specific fields
            twitter_handle: profileData.twitter_handle,
            twitter_followers: profileData.twitter_followers,
            engagement_rate: profileData.engagement_rate ? parseFloat(profileData.engagement_rate) : undefined,
            content_types: profileData.content_types || [],
            price_per_thread: profileData.price_per_thread,
            price_per_video: profileData.price_per_video,
            price_per_space: profileData.price_per_space,
          };

          // Update cache
          profileCache = {
            userId: user.id,
            data: transformedProfile,
            timestamp: Date.now(),
          };

          if (isMounted) {
            setAgency(transformedProfile);
          }
        } else {
          // Update cache with null
          profileCache = {
            userId: user.id,
            data: null,
            timestamp: Date.now(),
          };

          if (isMounted) {
            setAgency(null);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        
        // Better error logging
        if (err instanceof Error) {
          console.error("Error fetching agency:", err.message, err);
          setError(err.message);
        } else if (err && typeof err === 'object') {
          const errorMessage = JSON.stringify(err);
          console.error("Error fetching agency:", errorMessage, err);
          setError(errorMessage || "Failed to fetch agency");
        } else {
          console.error("Error fetching agency:", String(err), err);
          setError("Failed to fetch agency");
        }
      } finally {
        isFetching = false;
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Debounce the fetch to prevent rapid calls
    fetchTimeout = setTimeout(() => {
      fetchMyAgency();
    }, 100);

    return () => {
      isMounted = false;
      isFetching = false;
      if (fetchTimeout) clearTimeout(fetchTimeout);
    };
  }, [user]);

  const refetch = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      const supabase = createSupabaseClient();

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        // Fetch services (only for agencies, KOLs don't have services)
        let services: string[] = [];
        if (profileData.profile_type !== "kol") {
          try {
            const { data: servicesData, error: servicesError } = await supabase
              .from("services")
              .select("name")
              .eq("profile_id", profileData.id);

            if (servicesError) {
              // If column doesn't exist yet, services will be empty
              console.warn("Error fetching services (may need migration):", servicesError);
            } else {
              services = servicesData?.map((s: any) => s.name) || [];
            }
          } catch (err) {
            // Silently fail - services table might not be migrated yet
            console.warn("Services query failed (may need migration):", err);
          }
        }

        const transformedProfile: Agency = {
          id: profileData.id,
          name: profileData.name,
          slug: profileData.slug,
          profile_type: profileData.profile_type || "agency",
          niche: profileData.niche,
          rating: parseFloat(profileData.rating) || 0,
          reviews: profileData.review_count || 0,
          location: profileData.location || "Remote",
          services: services,
          priceRange: profileData.price_range_min && profileData.price_range_max
            ? `$${(profileData.price_range_min / 1000).toFixed(0)}K - $${(profileData.price_range_max / 1000).toFixed(0)}K`
            : "Contact for pricing",
          priceRangeMin: profileData.price_range_min,
          priceRangeMax: profileData.price_range_max,
          verified: profileData.verified || false,
          description: profileData.description,
          website: profileData.website,
          email: profileData.email,
          founded: profileData.founded,
          team_size: profileData.team_size,
          solana_wallet: profileData.solana_wallet,
          wallet_verified: profileData.wallet_verified || false,
          // KOL-specific fields
          twitter_handle: profileData.twitter_handle,
          twitter_followers: profileData.twitter_followers,
          engagement_rate: profileData.engagement_rate ? parseFloat(profileData.engagement_rate) : undefined,
          content_types: profileData.content_types || [],
          price_per_thread: profileData.price_per_thread,
          price_per_video: profileData.price_per_video,
          price_per_space: profileData.price_per_space,
        };

        setAgency(transformedProfile);
      } else {
        // Clear agency if none found
        setAgency(null);
      }
    } catch (err) {
      // Better error logging
      if (err instanceof Error) {
        console.error("Error refetching agency:", err.message, err);
        setError(err.message);
      } else if (err && typeof err === 'object') {
        const errorMessage = JSON.stringify(err);
        console.error("Error refetching agency:", errorMessage, err);
        setError(errorMessage || "Failed to fetch agency");
      } else {
        console.error("Error refetching agency:", String(err), err);
        setError("Failed to fetch agency");
      }
      setAgency(null);
    } finally {
      setLoading(false);
    }
  };

  return { agency, loading, error, refetch };
}

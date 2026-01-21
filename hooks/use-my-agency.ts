"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/context";
import { Agency } from "@/hooks/use-agency";

export function useMyAgency() {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchMyAgency() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const supabase = createSupabaseClient();

        // Fetch profile by user_id
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        // Log for debugging
        if (profileError) {
          // If it's a "no rows" error, that's okay - user just doesn't have a profile yet
          if (profileError.code === 'PGRST116' || profileError.message?.includes('No rows')) {
            // This is expected - user doesn't have a profile yet
            setAgency(null);
            setLoading(false);
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
        if (agencyData) {
          console.log("Found agency:", agencyData.name, "user_id:", agencyData.user_id, "current user:", user.id);
        } else {
          console.log("No agency found for user:", user.id);
        }

        if (agencyData) {
          // Fetch services
          const { data: servicesData } = await supabase
            .from("services")
            .select("name")
            .eq("agency_id", agencyData.id);

          const services = servicesData?.map((s: any) => s.name) || [];

          const transformedAgency: Agency = {
            id: agencyData.id,
            name: agencyData.name,
            slug: agencyData.slug,
            niche: agencyData.niche,
            rating: parseFloat(agencyData.rating) || 0,
            reviews: agencyData.review_count || 0,
            location: agencyData.location || "Remote",
            services: services,
            priceRange: agencyData.price_range_min && agencyData.price_range_max
              ? `$${agencyData.price_range_min.toLocaleString()} - $${agencyData.price_range_max.toLocaleString()}`
              : "Contact for pricing",
            priceRangeMin: agencyData.price_range_min,
            priceRangeMax: agencyData.price_range_max,
            verified: agencyData.verified || false,
            featured: agencyData.featured || false,
            premium: agencyData.premium || false,
            description: agencyData.description,
            website: agencyData.website,
            email: agencyData.email,
            founded: agencyData.founded,
            teamSize: agencyData.team_size,
            walletAddress: agencyData.wallet_address,
          };

          setAgency(transformedAgency);
        } else {
          setAgency(null);
        }
      } catch (err) {
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
        setLoading(false);
      }
    }

    fetchMyAgency();
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
        const { data: servicesData } = await supabase
          .from("services")
          .select("name")
          .eq("profile_id", profileData.id);

        const services = servicesData?.map((s: any) => s.name) || [];

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

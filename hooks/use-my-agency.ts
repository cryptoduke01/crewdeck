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

        // Fetch agency by user_id
        const { data: agencyData, error: agencyError } = await supabase
          .from("agencies")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        // Log for debugging
        if (agencyError) {
          // If it's a "no rows" error, that's okay - user just doesn't have an agency yet
          if (agencyError.code === 'PGRST116' || agencyError.message?.includes('No rows')) {
            // This is expected - user doesn't have an agency yet
            setAgency(null);
            setLoading(false);
            return;
          }
          // For other errors, log and throw
          console.error("Error fetching agency:", {
            message: agencyError.message,
            code: agencyError.code,
            details: agencyError.details,
            hint: agencyError.hint,
            fullError: agencyError
          });
          throw agencyError;
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
            description: agencyData.description,
            website: agencyData.website,
            email: agencyData.email,
            founded: agencyData.founded,
            teamSize: agencyData.team_size,
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

      const { data: agencyData, error: agencyError } = await supabase
        .from("agencies")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (agencyError && agencyError.code !== 'PGRST116') {
        throw agencyError;
      }

      if (agencyData) {
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
            ? `$${(agencyData.price_range_min / 1000).toFixed(0)}K - $${(agencyData.price_range_max / 1000).toFixed(0)}K`
            : "Contact for pricing",
          priceRangeMin: agencyData.price_range_min,
          priceRangeMax: agencyData.price_range_max,
          verified: agencyData.verified || false,
          description: agencyData.description,
          website: agencyData.website,
          email: agencyData.email,
          founded: agencyData.founded,
          teamSize: agencyData.team_size,
        };

        setAgency(transformedAgency);
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

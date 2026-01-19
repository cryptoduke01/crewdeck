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
          console.error("Error fetching agency:", agencyError);
          // If it's a "no rows" error, that's okay
          if (agencyError.code !== 'PGRST116') {
            throw agencyError;
          }
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
        console.error("Error fetching agency:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch agency");
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
      setError(err instanceof Error ? err.message : "Failed to fetch agency");
      setAgency(null);
    } finally {
      setLoading(false);
    }
  };

  return { agency, loading, error, refetch };
}

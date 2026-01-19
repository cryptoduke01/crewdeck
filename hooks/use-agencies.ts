"use client";

import { useState, useEffect, useMemo } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export interface Agency {
  id: string;
  name: string;
  niche: string;
  rating: number;
  reviews: number;
  location: string;
  services: string[];
  priceRange: string;
  priceRangeMin?: number;
  priceRangeMax?: number;
  verified: boolean;
  description?: string;
  website?: string;
  email?: string;
}

export type SortOption = "rating" | "price-low" | "price-high" | "newest" | "reviews";

export function useAgencies(options?: {
  niche?: string;
  searchQuery?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  services?: string[];
  sortBy?: SortOption;
}) {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgencies() {
      try {
        setLoading(true);
        setError(null);

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey && supabaseUrl !== "your_supabase_project_url") {
          const supabase = createSupabaseClient();
          
          let query = supabase
            .from("agencies")
            .select("*")
            .eq("verified", true)
            .order("featured", { ascending: false }); // Featured agencies first

          // Apply filters
          if (options?.niche && options.niche !== "All") {
            query = query.eq("niche", options.niche);
          }

          if (options?.location && options.location !== "All") {
            query = query.eq("location", options.location);
          }

          if (options?.minPrice !== undefined) {
            query = query.gte("price_range_min", options.minPrice);
          }

          if (options?.maxPrice !== undefined) {
            query = query.lte("price_range_max", options.maxPrice);
          }

          if (options?.searchQuery) {
            const searchTerm = options.searchQuery.trim();
            if (searchTerm) {
              // Full-text search across multiple fields
              // Search in name, description, niche, and location
              query = query.or(
                `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,niche.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`
              );
            }
          }

          // Apply sorting
          if (options?.sortBy) {
            switch (options.sortBy) {
              case "rating":
                query = query.order("rating", { ascending: false });
                break;
              case "price-low":
                query = query.order("price_range_min", { ascending: true });
                break;
              case "price-high":
                query = query.order("price_range_max", { ascending: false });
                break;
              case "reviews":
                query = query.order("review_count", { ascending: false });
                break;
              case "newest":
                query = query.order("created_at", { ascending: false });
                break;
            }
          } else {
            query = query.order("rating", { ascending: false });
          }

          const { data, error: queryError } = await query;

          if (queryError) throw queryError;

          // Fetch services for each agency
          const agenciesWithServices = await Promise.all(
            (data || []).map(async (agency: any) => {
              const { data: servicesData } = await supabase
                .from("services")
                .select("name")
                .eq("agency_id", agency.id);

              const services = servicesData?.map((s: any) => s.name) || [];

              return {
                id: agency.id,
                name: agency.name,
                niche: agency.niche,
                rating: parseFloat(agency.rating) || 0,
                reviews: agency.review_count || 0,
                location: agency.location || "Remote",
                services: services,
                priceRange: agency.price_range_min && agency.price_range_max
                  ? `$${agency.price_range_min.toLocaleString()} - $${agency.price_range_max.toLocaleString()}`
                  : "Contact for pricing",
                priceRangeMin: agency.price_range_min,
                priceRangeMax: agency.price_range_max,
                verified: agency.verified || false,
                description: agency.description,
                website: agency.website,
                email: agency.email,
              };
            })
          );

          // Filter by services if specified
          let filteredAgencies = agenciesWithServices;
          if (options?.services && options.services.length > 0) {
            filteredAgencies = agenciesWithServices.filter(agency =>
              options.services!.some(selectedService =>
                agency.services.some((service: string) =>
                  service.toLowerCase().includes(selectedService.toLowerCase())
                )
              )
            );
          }

          const transformedAgencies: Agency[] = filteredAgencies;

          setAgencies(transformedAgencies);
        } else {
          // Supabase not configured - show empty state
          setAgencies([]);
          setError("Supabase not configured. Please set up your environment variables.");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching agencies:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch agencies");
        setAgencies([]);
        setLoading(false);
      }
    }

    fetchAgencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.niche, options?.searchQuery, options?.location, options?.minPrice, options?.maxPrice, options?.services, options?.sortBy]);

  return { agencies, loading, error };
}

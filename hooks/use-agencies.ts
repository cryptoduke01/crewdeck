"use client";

import { useState, useEffect, useMemo } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  name: string;
  slug?: string;
  profile_type: "agency" | "kol";
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
  // KOL-specific fields
  twitter_handle?: string;
  twitter_followers?: number;
  engagement_rate?: number;
  content_types?: string[];
  price_per_thread?: number;
  price_per_video?: number;
  price_per_space?: number;
  wallet_verified?: boolean;
  solana_wallet?: string;
  logo_url?: string;
}

// Keep Agency as alias for backward compatibility during migration
export type Agency = Profile;

export type SortOption = "rating" | "price-low" | "price-high" | "newest" | "reviews" | "featured";

export function useAgencies(options?: {
  profileType?: "agency" | "kol" | "all";
  niche?: string;
  searchQuery?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  services?: string[];
  sortBy?: SortOption;
}) {
  const [agencies, setAgencies] = useState<Profile[]>([]);
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
            .from("profiles")
            .select("*");

          // Filter by profile type
          if (options?.profileType && options.profileType !== "all") {
            query = query.eq("profile_type", options.profileType);
          }
          
          // Default ordering by rating
          query = query.order("rating", { ascending: false });
          
          // Only filter by verified if we have verified agencies, otherwise show all
          // This allows testing with unverified agencies
          // In production, you can add back: .eq("verified", true)

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
              case "featured":
                // Featured first, then by rating
                query = query.order("featured", { ascending: false }).order("rating", { ascending: false });
                break;
            }
          } else {
            // Default: Rating first (removed premium/featured as we're not using monetization)
            // Keep as rating-based sorting
          }

          const { data, error: queryError } = await query;

          if (queryError) throw queryError;

          // Fetch all services in one query (fixes N+1 problem)
          const profileIds = (data || []).map((a: any) => a.id);
          let servicesMap: Record<string, string[]> = {};
          
          if (profileIds.length > 0) {
            const { data: allServices } = await supabase
              .from("services")
              .select("profile_id, name")
              .in("profile_id", profileIds);

            // Group services by profile_id
            servicesMap = (allServices || []).reduce((acc: Record<string, string[]>, service: any) => {
              if (!acc[service.profile_id]) {
                acc[service.profile_id] = [];
              }
              acc[service.profile_id].push(service.name);
              return acc;
            }, {});
          }

          // Transform profiles with services from map
          const profilesWithServices = (data || []).map((profile: any) => ({
            id: profile.id,
            name: profile.name,
            slug: profile.slug,
            profile_type: profile.profile_type || "agency",
            niche: profile.niche,
            rating: parseFloat(profile.rating) || 0,
            reviews: profile.review_count || 0,
            location: profile.location || "Remote",
            services: servicesMap[profile.id] || [],
            priceRange: profile.price_range_min && profile.price_range_max
              ? `$${profile.price_range_min.toLocaleString()} - $${profile.price_range_max.toLocaleString()}`
              : "Contact for pricing",
            priceRangeMin: profile.price_range_min,
            priceRangeMax: profile.price_range_max,
            verified: profile.verified || false,
            description: profile.description,
            website: profile.website,
            email: profile.email,
            // KOL-specific fields
            twitter_handle: profile.twitter_handle,
            twitter_followers: profile.twitter_followers,
            engagement_rate: profile.engagement_rate ? parseFloat(profile.engagement_rate) : undefined,
            content_types: profile.content_types || [],
            price_per_thread: profile.price_per_thread,
            price_per_video: profile.price_per_video,
            price_per_space: profile.price_per_space,
            wallet_verified: profile.wallet_verified || false,
            solana_wallet: profile.solana_wallet,
          }));

          // Filter by services if specified
          let filteredProfiles = profilesWithServices;
          if (options?.services && options.services.length > 0) {
            filteredProfiles = profilesWithServices.filter(profile =>
              options.services!.some(selectedService =>
                profile.services.some((service: string) =>
                  service.toLowerCase().includes(selectedService.toLowerCase())
                )
              )
            );
          }

          const transformedProfiles: Profile[] = filteredProfiles;

          setAgencies(transformedProfiles);
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

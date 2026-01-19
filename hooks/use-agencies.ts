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

// Fallback mock data when Supabase is not configured
const mockAgencies: Agency[] = [
  {
    id: "1",
    name: "Crypto Marketing Pros",
    niche: "DeFi",
    rating: 4.9,
    reviews: 127,
    location: "Remote",
    services: ["Social Media", "Community Management", "Content"],
    priceRange: "$5K - $20K",
    priceRangeMin: 5000,
    priceRangeMax: 20000,
    verified: true,
  },
  {
    id: "2",
    name: "NFT Launch Studio",
    niche: "NFT",
    rating: 4.8,
    reviews: 89,
    location: "New York, US",
    services: ["Launch Strategy", "Influencer Marketing", "PR"],
    priceRange: "$10K - $50K",
    priceRangeMin: 10000,
    priceRangeMax: 50000,
    verified: true,
  },
  {
    id: "3",
    name: "Web3 Growth Agency",
    niche: "Web3",
    rating: 5.0,
    reviews: 203,
    location: "San Francisco, US",
    services: ["Growth Hacking", "Marketing Strategy", "Analytics"],
    priceRange: "$15K - $100K",
    priceRangeMin: 15000,
    priceRangeMax: 100000,
    verified: true,
  },
];

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
            .eq("verified", true);

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
            query = query.or(
              `name.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`
            );
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
          // Fallback to mock data with client-side filtering
          await new Promise((resolve) => setTimeout(resolve, 300));

          let filtered = [...mockAgencies];

          if (options?.niche && options.niche !== "All") {
            filtered = filtered.filter((a) => a.niche === options.niche);
          }

          if (options?.location && options.location !== "All") {
            filtered = filtered.filter((a) => a.location === options.location);
          }

          if (options?.minPrice !== undefined) {
            filtered = filtered.filter((a) => (a.priceRangeMin || 0) >= options.minPrice!);
          }

          if (options?.maxPrice !== undefined) {
            filtered = filtered.filter((a) => (a.priceRangeMax || Infinity) <= options.maxPrice!);
          }

          if (options?.searchQuery) {
            const query = options.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (a) =>
                a.name.toLowerCase().includes(query) ||
                a.services.some((s) => s.toLowerCase().includes(query))
            );
          }

          if (options?.services && options.services.length > 0) {
            filtered = filtered.filter(agency =>
              options.services!.some(selectedService =>
                agency.services.some((service: string) =>
                  service.toLowerCase().includes(selectedService.toLowerCase())
                )
              )
            );
          }

          // Client-side sorting
          if (options?.sortBy) {
            filtered.sort((a, b) => {
              switch (options.sortBy) {
                case "rating":
                  return b.rating - a.rating;
                case "price-low":
                  return (a.priceRangeMin || 0) - (b.priceRangeMin || 0);
                case "price-high":
                  return (b.priceRangeMax || Infinity) - (a.priceRangeMax || Infinity);
                case "reviews":
                  return b.reviews - a.reviews;
                default:
                  return 0;
              }
            });
          }

          setAgencies(filtered);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching agencies:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch agencies");
        
        setAgencies(mockAgencies);
        setLoading(false);
      }
    }

    fetchAgencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.niche, options?.searchQuery, options?.location, options?.minPrice, options?.maxPrice, options?.services, options?.sortBy]);

  return { agencies, loading, error };
}

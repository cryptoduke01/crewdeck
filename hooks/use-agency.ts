"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export interface Agency {
  id: string;
  name: string;
  slug: string;
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
  founded?: number;
  teamSize?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  metrics?: string;
  image?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  author?: string;
  createdAt: string;
}

export interface AgencyData extends Agency {
  portfolio: PortfolioItem[];
  reviewsList: Review[];
}

export function useAgency(id: string) {
  const [agency, setAgency] = useState<AgencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgency() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey && supabaseUrl !== "your_supabase_project_url") {
          const supabase = createSupabaseClient();

          // Fetch agency
          const { data: agencyData, error: agencyError } = await supabase
            .from("agencies")
            .select("*")
            .eq("id", id)
            .single();

          if (agencyError) throw agencyError;
          if (!agencyData) {
            setError("Agency not found");
            setLoading(false);
            return;
          }

          // Fetch services
          const { data: servicesData } = await supabase
            .from("services")
            .select("name")
            .eq("agency_id", id);

          const services = servicesData?.map((s: any) => s.name) || [];

          // Fetch portfolio
          const { data: portfolioData } = await supabase
            .from("portfolio")
            .select("*")
            .eq("agency_id", id)
            .order("created_at", { ascending: false });
          
          const portfolio: PortfolioItem[] = (portfolioData || []).map((p: any) => {
            let imageUrl = p.image || '';
            
            // Handle different image URL formats
            if (imageUrl) {
              // If it's already a full URL, use it
              if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                // Already a full URL, use as is
              } 
              // If it's a storage path (contains agency ID or portfolio-images)
              else if (imageUrl.includes('/') || imageUrl.includes('portfolio-images')) {
                try {
                  // Extract the path - could be "agencyId/filename" or "portfolio-images/path"
                  let storagePath = imageUrl;
                  
                  // Remove bucket prefix if present
                  if (storagePath.includes('portfolio-images/')) {
                    storagePath = storagePath.split('portfolio-images/')[1];
                  }
                  
                  // Get public URL from Supabase Storage
                  const { data: { publicUrl } } = supabase.storage
                    .from("portfolio-images")
                    .getPublicUrl(storagePath);
                  
                  imageUrl = publicUrl;
                } catch (err) {
                  console.warn("Could not generate public URL for image:", imageUrl, err);
                  imageUrl = '';
                }
              }
              // If it's just a filename, assume it's in the agency's folder
              else {
                try {
                  const { data: { publicUrl } } = supabase.storage
                    .from("portfolio-images")
                    .getPublicUrl(`${agencyData.id}/${imageUrl}`);
                  imageUrl = publicUrl;
                } catch (err) {
                  console.warn("Could not generate public URL for image:", imageUrl, err);
                  imageUrl = '';
                }
              }
            }
            
            return {
              id: p.id,
              title: p.title || '',
              description: p.description || '',
              metrics: p.metrics || '',
              image: imageUrl,
            };
          });

          // Fetch reviews
          const { data: reviewsData } = await supabase
            .from("reviews")
            .select("*")
            .eq("agency_id", id)
            .order("created_at", { ascending: false });

          const reviews: Review[] = (reviewsData || []).map((r: any) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            author: r.author,
            createdAt: r.created_at,
          }));

          // Transform agency data
          const transformedAgency: AgencyData = {
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
            verified: agencyData.verified || false,
            description: agencyData.description,
            website: agencyData.website,
            email: agencyData.email,
            founded: agencyData.founded,
            teamSize: agencyData.team_size,
            portfolio: portfolio,
            reviewsList: reviews,
          };

          setAgency(transformedAgency);
        } else {
          // Fallback for development without Supabase
          setError("Supabase not configured");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching agency:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch agency");
        setLoading(false);
      }
    }

    fetchAgency();
  }, [id]);

  return { agency, loading, error };
}

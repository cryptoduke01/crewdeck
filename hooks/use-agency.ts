"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  name: string;
  slug: string;
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
  founded?: number;
  team_size?: number;
  solana_wallet?: string;
  wallet_verified?: boolean;
  // KOL-specific fields
  twitter_handle?: string;
  twitter_followers?: number;
  engagement_rate?: number;
  content_types?: string[];
  price_per_thread?: number;
  price_per_video?: number;
  price_per_space?: number;
}

// Keep Agency as alias for backward compatibility
export type Agency = Profile;

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

export interface ProfileData extends Profile {
  portfolio: PortfolioItem[];
  reviewsList: Review[];
}

export function useAgency(id: string) {
  const [agency, setAgency] = useState<ProfileData | null>(null);
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

          // Fetch profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .single();

          if (profileError) throw profileError;
          if (!profileData) {
            setError("Profile not found");
            setLoading(false);
            return;
          }

          // Fetch services
          const { data: servicesData } = await supabase
            .from("services")
            .select("name")
            .eq("profile_id", id);

          const services = servicesData?.map((s: any) => s.name) || [];

          // Fetch portfolio
          const { data: portfolioData } = await supabase
            .from("portfolio")
            .select("*")
            .eq("profile_id", id)
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
                    .getPublicUrl(`${profileData.id}/${imageUrl}`);
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

          // Transform profile data
          const transformedProfile: ProfileData = {
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
            portfolio: portfolio,
            reviewsList: reviews,
          };

          setAgency(transformedProfile);
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

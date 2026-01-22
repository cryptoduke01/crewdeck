"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth/context";
import { useMyAgency } from "@/hooks/use-my-agency";
import { Loading } from "@/components/loading";
import { useToast } from "@/lib/toast/context";
import { createSupabaseClient } from "@/lib/supabase/client";
import { PortfolioManager } from "@/components/portfolio-manager";
import { analytics } from "@/lib/analytics/client";
import { ImageUpload } from "@/components/image-upload";

const niches = ["DeFi", "NFT", "Web3", "Gaming", "Metaverse"];

export default function EditProfilePage() {
  const { user } = useAuth();
  const { agency, loading: agencyLoading, refetch } = useMyAgency();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    niche: "Web3",
    location: "",
    website: "",
    email: "",
    founded: "",
    teamSize: "",
    priceRangeMin: "",
    priceRangeMax: "",
    logo_url: "",
    // KOL-specific fields
    twitterHandle: "",
    twitterFollowers: "",
    engagementRate: "",
    contentTypes: [] as string[],
    pricePerThread: "",
    pricePerVideo: "",
    pricePerSpace: "",
    solanaWallet: "",
  });

  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [saving, setSaving] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<Array<{
    title: string;
    description: string;
    image: string;
    metrics: string;
  }>>([]);

  // Determine if creating or editing (must be before conditional returns)
  const isCreating = !agency && !agencyLoading;

  // Initialize form data - all hooks must be before conditional returns
  useEffect(() => {
    if (agency) {
      setFormData({
        name: agency.name || "",
        description: agency.description || "",
        niche: agency.niche || "Web3",
        location: agency.location || "",
        website: agency.website || "",
        email: agency.email || "",
        founded: agency.founded?.toString() || "",
        teamSize: agency.team_size?.toString() || "",
        priceRangeMin: agency.priceRangeMin ? String(agency.priceRangeMin) : "",
        priceRangeMax: agency.priceRangeMax ? String(agency.priceRangeMax) : "",
        // KOL-specific fields
        twitterHandle: (agency as any).twitter_handle || "",
        twitterFollowers: (agency as any).twitter_followers?.toString() || "",
        engagementRate: (agency as any).engagement_rate?.toString() || "",
        contentTypes: (agency as any).content_types || [],
        pricePerThread: (agency as any).price_per_thread?.toString() || "",
        pricePerVideo: (agency as any).price_per_video?.toString() || "",
        pricePerSpace: (agency as any).price_per_space?.toString() || "",
        solanaWallet: (agency as any).solana_wallet || "",
        logo_url: (agency as any).logo_url || (agency as any).profile_picture || "",
      });
      setServices(agency.services || []);
      
      // Fetch portfolio items
      if (agency.id) {
        fetchPortfolioItems(agency.id);
      }
    }
  }, [agency]);

  const fetchPortfolioItems = async (agencyId: string) => {
    try {
      const supabase = createSupabaseClient();
      const { data } = await supabase
        .from("portfolio")
        .select("*")
        .eq("profile_id", agencyId)
        .order("created_at", { ascending: false });
      
      if (data) {
        setPortfolioItems(data.map((item: any) => ({
          title: item.title || "",
          description: item.description || "",
          image: item.image || "",
          metrics: item.metrics || "",
        })));
      }
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    }
  };

  // Initialize form for new agency creation
  useEffect(() => {
    if (!agency && !agencyLoading && user && formData.name === "" && formData.email === "") {
      setFormData({
        name: "",
        description: "",
        niche: "Web3",
        location: "",
        website: "",
        email: user.email || "",
        founded: "",
        teamSize: "",
        priceRangeMin: "",
        priceRangeMax: "",
        logo_url: "",
        twitterHandle: "",
        twitterFollowers: "",
        engagementRate: "",
        contentTypes: [],
        pricePerThread: "",
        pricePerVideo: "",
        pricePerSpace: "",
        solanaWallet: "",
      });
    }
  }, [agency, agencyLoading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const supabase = createSupabaseClient();

      // Parse price ranges (store as full dollar amounts)
      // Handle empty strings and invalid values properly
      const priceMin = formData.priceRangeMin && formData.priceRangeMin.trim()
        ? (parseInt(formData.priceRangeMin) || null)
        : null;
      const priceMax = formData.priceRangeMax && formData.priceRangeMax.trim()
        ? (parseInt(formData.priceRangeMax) || null)
        : null;

      // Generate unique slug
      let baseSlug = formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const uniqueSlug = agency 
        ? agency.slug 
        : `${baseSlug}-${user.id.substring(0, 8)}-${Date.now().toString().slice(-6)}`;

      if (isCreating) {
        // Check if user already has a profile (prevent duplicates)
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingProfile) {
          showError(
            "Profile already exists",
            "You already have a profile. Please refresh the page to edit it."
          );
          await refetch();
          router.push("/dashboard/agency");
          return;
        }

        // Get profile_type from user metadata (set during signup) or default to agency
        // The trigger already created a profile with the correct type, so we should fetch it instead
        // But if for some reason it doesn't exist, we'll create one with the type from metadata
        let profileType = user.user_metadata?.profile_type || "agency";
        
        // Create new profile
        const insertData: any = {
          name: formData.name,
          slug: uniqueSlug,
          description: formData.description || null,
          niche: formData.niche,
          location: formData.location || null,
          website: formData.website || null,
          email: formData.email || null,
          price_range_min: priceMin,
          price_range_max: priceMax,
          verified: true, // Auto-verify for development (change to false for production)
          user_id: user.id,
          profile_type: profileType,
        };

        // Only add agency-specific fields if profile type is agency
        if (profileType === "agency") {
          insertData.founded = formData.founded ? parseInt(formData.founded) : null;
          insertData.team_size = formData.teamSize ? parseInt(formData.teamSize) : null;
        }

        // Add KOL-specific fields if profile type is kol
        if (profileType === "kol") {
          insertData.twitter_handle = formData.twitterHandle || null;
          insertData.twitter_followers = formData.twitterFollowers ? parseInt(formData.twitterFollowers) : null;
          insertData.engagement_rate = formData.engagementRate ? parseFloat(formData.engagementRate) : null;
          insertData.content_types = formData.contentTypes || [];
          insertData.price_per_thread = formData.pricePerThread ? parseInt(formData.pricePerThread) : null;
          insertData.price_per_video = formData.pricePerVideo ? parseInt(formData.pricePerVideo) : null;
          insertData.price_per_space = formData.pricePerSpace ? parseInt(formData.pricePerSpace) : null;
        }

        // Add Solana wallet for both types
        insertData.solana_wallet = formData.solanaWallet || null;
        
        // Add logo/profile picture if uploaded
        if (formData.logo_url) {
          insertData.logo_url = formData.logo_url;
        }

        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert(insertData)
          .select()
          .single();

        if (createError) {
          // Check if error is due to duplicate user_id
          if (createError.message?.includes('duplicate') || createError.message?.includes('unique') || createError.message?.includes('already exists')) {
            showError(
              "Agency already exists",
              "You already have an agency profile. Please refresh the page to edit it."
            );
            await refetch();
            router.push("/dashboard/agency");
            return;
          }
          throw createError;
        }

        // Update services for new profile
        if (services.length > 0 && newProfile) {
          const servicesToInsert = services.map((service) => ({
            profile_id: newProfile.id,
            name: service,
          }));

          const { error: insertError } = await supabase
            .from("services")
            .insert(servicesToInsert);

          if (insertError) throw insertError;
        }

        // Save portfolio items for new profile
        if (newProfile && portfolioItems.length > 0) {
          await savePortfolioItems(newProfile.id);
        }

        analytics.track("Profile Created", {
          profileId: newProfile.id,
          profileName: formData.name,
          profileType: profileType,
          niche: formData.niche,
        });

        showSuccess("Agency created!", "Your profile has been created successfully.");
        // Wait a bit for the database to be ready, then refetch
        await new Promise(resolve => setTimeout(resolve, 800));
        await refetch();
        // Wait a bit more to ensure state is updated before navigation
        await new Promise(resolve => setTimeout(resolve, 200));
        // Navigate - dashboard will also refetch when user/auth state is ready
        router.push("/dashboard/agency");
        return;
      }

      // Update existing profile
      if (agency) {
        const profileType = (agency as any)?.profile_type || "agency";
        const updateData: any = {
          name: formData.name,
          description: formData.description || null,
          niche: formData.niche,
          location: formData.location || null,
          website: formData.website || null,
          email: formData.email || null,
          solana_wallet: formData.solanaWallet || null,
        };

        // Add logo_url if uploaded
        if (formData.logo_url) {
          updateData.logo_url = formData.logo_url;
        }

        // Only include fields relevant to profile type
        if (profileType === "kol") {
          // KOL-specific fields only
          updateData.twitter_handle = formData.twitterHandle && formData.twitterHandle.trim() 
            ? formData.twitterHandle.trim() 
            : null;
          updateData.twitter_followers = formData.twitterFollowers && formData.twitterFollowers.trim() 
            ? (parseInt(formData.twitterFollowers) || null)
            : null;
          updateData.engagement_rate = formData.engagementRate && formData.engagementRate.trim()
            ? (parseFloat(formData.engagementRate) || null)
            : null;
          updateData.content_types = formData.contentTypes && formData.contentTypes.length > 0
            ? formData.contentTypes
            : [];
          updateData.price_per_thread = formData.pricePerThread && formData.pricePerThread.trim()
            ? (parseInt(formData.pricePerThread) || null)
            : null;
          updateData.price_per_video = formData.pricePerVideo && formData.pricePerVideo.trim()
            ? (parseInt(formData.pricePerVideo) || null)
            : null;
          updateData.price_per_space = formData.pricePerSpace && formData.pricePerSpace.trim()
            ? (parseInt(formData.pricePerSpace) || null)
            : null;
          
          // Explicitly exclude agency fields for KOLs
          delete updateData.founded;
          delete updateData.team_size;
          delete updateData.price_range_min;
          delete updateData.price_range_max;
        } else {
          // Agency-specific fields only
          updateData.founded = formData.founded && formData.founded.trim()
            ? (parseInt(formData.founded) || null)
            : null;
          updateData.team_size = formData.teamSize && formData.teamSize.trim()
            ? (parseInt(formData.teamSize) || null)
            : null;
          updateData.price_range_min = priceMin;
          updateData.price_range_max = priceMax;
          
          // Explicitly exclude KOL fields for agencies
          delete updateData.twitter_handle;
          delete updateData.twitter_followers;
          delete updateData.engagement_rate;
          delete updateData.content_types;
          delete updateData.price_per_thread;
          delete updateData.price_per_video;
          delete updateData.price_per_space;
        }

        // Clean update data - remove undefined values, empty strings, and handle NaN/null properly
        const cleanUpdateData: any = {};
        Object.keys(updateData).forEach(key => {
          const value = updateData[key];
          // Only include defined values, and convert NaN/empty strings to null
          if (value !== undefined) {
            if (typeof value === 'number' && isNaN(value)) {
              // Skip NaN values
              return;
            } else if (typeof value === 'string' && value.trim() === '') {
              // Convert empty strings to null
              cleanUpdateData[key] = null;
            } else if (value === '') {
              // Convert empty string to null
              cleanUpdateData[key] = null;
            } else {
              cleanUpdateData[key] = value;
            }
          }
        });

        // Log for debugging
        console.log("Updating profile with data:", cleanUpdateData);

        const { error: profileError, data: updatedData } = await supabase
          .from("profiles")
          .update(cleanUpdateData)
          .eq("id", agency.id)
          .select();

        if (profileError) {
          // Better error logging - handle different error structures
          const errorDetails = {
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            code: profileError.code,
            status: (profileError as any).status,
            statusText: (profileError as any).statusText,
            fullError: JSON.stringify(profileError, Object.getOwnPropertyNames(profileError)),
            updateData: cleanUpdateData,
            profileType: profileType
          };
          
          console.error("Profile update error details:", errorDetails);
          
          // Provide more specific error message
          let errorMsg = profileError.message || "Unknown error";
          if (profileError.details) {
            errorMsg += `: ${profileError.details}`;
          } else if ((profileError as any).status) {
            errorMsg += ` (Status: ${(profileError as any).status})`;
          }
          if (profileError.hint) {
            errorMsg += ` (${profileError.hint})`;
          }
          throw new Error(errorMsg);
        }

        // Update services (only for agencies, not KOLs)
        if (profileType !== "kol") {
          const { error: deleteError } = await supabase
            .from("services")
            .delete()
            .eq("profile_id", agency.id);

          if (deleteError) throw deleteError;

          if (services.length > 0) {
            const servicesToInsert = services.map((service) => ({
              profile_id: agency.id,
              name: service,
            }));

            const { error: insertError } = await supabase
              .from("services")
              .insert(servicesToInsert);

            if (insertError) throw insertError;
          }
        }

        // Update portfolio items (don't fail the whole update if portfolio save fails)
        // Portfolio is optional - users can add it later
        try {
          await savePortfolioItems(agency.id);
        } catch (portfolioErr) {
          // Better error logging
          const errorDetails = portfolioErr instanceof Error 
            ? portfolioErr.message 
            : JSON.stringify(portfolioErr, Object.getOwnPropertyNames(portfolioErr));
          console.error("Error saving portfolio (non-fatal, portfolio is optional):", errorDetails);
          // Don't throw - portfolio can be saved separately and is optional
        }

        analytics.track("Agency Profile Updated", {
          agencyId: agency.id,
          agencyName: formData.name,
        });

        showSuccess("Profile updated!", "Your changes have been saved.");
        await refetch();
        router.push("/dashboard/agency");
      }
    } catch (err) {
      showError("Failed to update profile", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const savePortfolioItems = async (agencyId: string) => {
    const supabase = createSupabaseClient();
    
    // Delete existing portfolio items
    const { error: deleteError } = await supabase
      .from("portfolio")
      .delete()
      .eq("agency_id", agencyId);

    if (deleteError) throw deleteError;

    // Insert new portfolio items
    if (portfolioItems.length > 0) {
      const itemsToInsert = portfolioItems
        .filter(item => item.title.trim() !== "") // Only save items with titles
        .map((item) => ({
          profile_id: agencyId,
          title: item.title,
          description: item.description || null,
          image: item.image || null,
          metrics: item.metrics || null,
        }));

      if (itemsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("portfolio")
          .insert(itemsToInsert);

        if (insertError) throw insertError;
      }
    }
  };

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  if (agencyLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/agency")}
              className="gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Button>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-semibold mb-2">
              {isCreating ? "Create agency profile" : "Edit profile"}
            </h1>
            <p className="text-sm text-foreground/60">
              {isCreating
                ? "Create your agency profile to get started."
                : "Update your agency information and make it stand out."}
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Basic Info */}
            <div className="p-6 rounded-lg border border-border bg-card space-y-4">
              <h2 className="text-lg font-semibold mb-4">Basic information</h2>

              {/* Profile Picture Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">
                  {(agency as any)?.profile_type === "kol" ? "Profile Picture" : "Logo"}
                </label>
                <ImageUpload
                  agencyId={agency?.id || "new"}
                  onUploadComplete={(url) => {
                    // Store in formData or state - we'll save it with the profile
                    setFormData({ ...formData, logo_url: url });
                  }}
                  currentImageUrl={(agency as any)?.logo_url || (agency as any)?.profile_picture}
                  folder="profiles"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground/80">
                  {(agency as any)?.profile_type === "kol" ? "Display Name *" : "Agency name *"}
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder={(agency as any)?.profile_type === "kol" ? "Your Display Name" : "Your Agency Name"}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground/80">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
                  placeholder={(agency as any)?.profile_type === "kol" 
                    ? "Your captivating bio - tell your story, what you do, and why projects should work with you..." 
                    : "Describe your agency and what makes it unique..."}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="niche" className="text-sm font-medium text-foreground/80">
                    Niche *
                  </label>
                  <select
                    id="niche"
                    required
                    value={formData.niche}
                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all cursor-pointer"
                  >
                    {niches.map((niche) => (
                      <option key={niche} value={niche}>
                        {niche}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium text-foreground/80">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="Remote, New York, US, etc."
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="p-6 rounded-lg border border-border bg-card space-y-4">
              <h2 className="text-lg font-semibold mb-4">Contact information</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground/80">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium text-foreground/80">
                    Website
                  </label>
                  <input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Services - Agency only */}
            {(agency as any)?.profile_type !== "kol" && (
              <div className="p-6 rounded-lg border border-border bg-card space-y-4">
                <h2 className="text-lg font-semibold mb-4">Services</h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addService();
                    }
                  }}
                  className="flex-1 h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Add a service..."
                />
                <Button
                  type="button"
                  onClick={addService}
                  variant="outline"
                  className="cursor-pointer"
                >
                  Add
                </Button>
              </div>

              {services.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted border border-border text-sm"
                    >
                      <span>{service}</span>
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                      >
                        <span className="text-xs">×</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              </div>
            )}

            {/* Pricing & Details - Agency specific */}
            {(agency as any)?.profile_type !== "kol" && (
              <div className="p-6 rounded-lg border border-border bg-card space-y-4">
                <h2 className="text-lg font-semibold mb-4">Pricing & details</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="priceMin" className="text-sm font-medium text-foreground/80">
                    Min price ($)
                  </label>
                  <input
                    id="priceMin"
                    type="number"
                    value={formData.priceRangeMin}
                    onChange={(e) => setFormData({ ...formData, priceRangeMin: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="5000"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="priceMax" className="text-sm font-medium text-foreground/80">
                    Max price ($)
                  </label>
                  <input
                    id="priceMax"
                    type="number"
                    value={formData.priceRangeMax}
                    onChange={(e) => setFormData({ ...formData, priceRangeMax: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="10000"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="founded" className="text-sm font-medium text-foreground/80">
                    Founded year
                  </label>
                  <input
                    id="founded"
                    type="number"
                    value={formData.founded}
                    onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="2020"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="teamSize" className="text-sm font-medium text-foreground/80">
                    Team size
                  </label>
                  <input
                    id="teamSize"
                    type="text"
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="10-15"
                  />
                </div>
              </div>
              </div>
            )}

            {/* Portfolio Section */}
            {!isCreating && agency && (
              <div className="p-6 rounded-lg border border-border bg-card">
                <PortfolioManager
                  agencyId={agency.id}
                  initialItems={portfolioItems}
                  onSave={async (items) => {
                    setPortfolioItems(items);
                    await savePortfolioItems(agency.id);
                    analytics.track("Portfolio Updated", {
                      agencyId: agency.id,
                      itemCount: items.length,
                    });
                  }}
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={saving}
                size="lg"
                className="gap-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/agency")}
                size="lg"
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}

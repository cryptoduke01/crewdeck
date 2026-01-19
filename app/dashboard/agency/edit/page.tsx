"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth/context";
import { useMyAgency } from "@/hooks/use-my-agency";
import { Loading } from "@/components/loading";
import { useToast } from "@/lib/toast/context";
import { createSupabaseClient } from "@/lib/supabase/client";
import { PortfolioManager } from "@/components/portfolio-manager";
import { analytics } from "@/lib/analytics/client";

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
        teamSize: agency.teamSize || "",
        priceRangeMin: agency.priceRangeMin ? String(agency.priceRangeMin) : "",
        priceRangeMax: agency.priceRangeMax ? String(agency.priceRangeMax) : "",
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
        .eq("agency_id", agencyId)
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
      const priceMin = formData.priceRangeMin ? parseInt(formData.priceRangeMin) : null;
      const priceMax = formData.priceRangeMax ? parseInt(formData.priceRangeMax) : null;

      // Generate unique slug
      let baseSlug = formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const uniqueSlug = agency 
        ? agency.slug 
        : `${baseSlug}-${user.id.substring(0, 8)}-${Date.now().toString().slice(-6)}`;

      if (isCreating) {
        // Create new agency
        const { data: newAgency, error: createError } = await supabase
          .from("agencies")
          .insert({
            name: formData.name,
            slug: uniqueSlug,
            description: formData.description || null,
            niche: formData.niche,
            location: formData.location || null,
            website: formData.website || null,
            email: formData.email || null,
            founded: formData.founded ? parseInt(formData.founded) : null,
            team_size: formData.teamSize || null,
            price_range_min: priceMin,
            price_range_max: priceMax,
            verified: true, // Auto-verify for development (change to false for production)
            user_id: user.id,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Update services for new agency
        if (services.length > 0 && newAgency) {
          const servicesToInsert = services.map((service) => ({
            agency_id: newAgency.id,
            name: service,
          }));

          const { error: insertError } = await supabase
            .from("services")
            .insert(servicesToInsert);

          if (insertError) throw insertError;
        }

        // Save portfolio items for new agency
        if (newAgency && portfolioItems.length > 0) {
          await savePortfolioItems(newAgency.id);
        }

        analytics.track("Agency Profile Created", {
          agencyId: newAgency.id,
          agencyName: formData.name,
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

      // Update existing agency
      if (agency) {
        const { error: agencyError } = await supabase
          .from("agencies")
          .update({
            name: formData.name,
            description: formData.description || null,
            niche: formData.niche,
            location: formData.location || null,
            website: formData.website || null,
            email: formData.email || null,
            founded: formData.founded ? parseInt(formData.founded) : null,
            team_size: formData.teamSize || null,
            price_range_min: priceMin,
            price_range_max: priceMax,
          })
          .eq("id", agency.id);

        if (agencyError) throw agencyError;

        // Update services (delete all, then insert new ones)
        const { error: deleteError } = await supabase
          .from("services")
          .delete()
          .eq("agency_id", agency.id);

        if (deleteError) throw deleteError;

        if (services.length > 0) {
          const servicesToInsert = services.map((service) => ({
            agency_id: agency.id,
            name: service,
          }));

          const { error: insertError } = await supabase
            .from("services")
            .insert(servicesToInsert);

          if (insertError) throw insertError;
        }

        // Update portfolio items (don't fail the whole update if portfolio save fails)
        try {
          await savePortfolioItems(agency.id);
        } catch (portfolioErr) {
          console.error("Error saving portfolio:", portfolioErr);
          // Don't throw - portfolio can be saved separately
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
          agency_id: agencyId,
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

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground/80">
                  Agency name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Your Agency Name"
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
                  placeholder="Describe your agency and what makes it unique..."
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

            {/* Services */}
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

            {/* Pricing & Details */}
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
                    <Loader2 className="h-4 w-4 animate-spin" />
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

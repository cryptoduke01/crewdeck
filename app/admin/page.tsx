"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Shield, 
  Building2, 
  Mail, 
  Star, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Search,
  Filter,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Loading } from "@/components/loading";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast/context";
import { exportToCSV } from "@/lib/export";
import { Download } from "lucide-react";
import { sendVerificationEmail } from "@/lib/email/utils";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

interface Agency {
  id: string;
  name: string;
  slug: string;
  email?: string;
  verified: boolean;
  featured?: boolean;
  rating: number;
  reviews: number; // Calculated from reviews table
  created_at: string;
  user_id: string;
  profile_type?: "agency" | "kol";
}

interface Stats {
  totalAgencies: number;
  verifiedAgencies: number;
  pendingAgencies: number;
  totalMessages: number;
  totalReviews: number;
}

// Admin panel is for developers/platform owners only
// Access is controlled by 6-digit passcode set in NEXT_PUBLIC_ADMIN_PASSCODE

export default function AdminPage() {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalAgencies: 0,
    verifiedAgencies: 0,
    pendingAgencies: 0,
    totalMessages: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "pending">("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "verify" | "unverify" | "delete";
    agencyId: string;
    agencyName: string;
    verified?: boolean;
  } | null>(null);

  useEffect(() => {
    // Check if authenticated via passcode
    const authenticated = sessionStorage.getItem("admin_authenticated");
    
    if (authenticated !== "true") {
      router.push("/admin/lock");
      return;
    }

    setIsAuthenticated(true);
    fetchData();
    setCheckingAccess(false);
  }, [router]);

  async function fetchData() {
    try {
      setLoading(true);
      const supabase = createSupabaseClient();

      // Fetch agencies
      const { data: agenciesData, error: agenciesError } = await supabase
        .from("profiles")
        .select("id, name, slug, email, verified, created_at, user_id, profile_type")
        .order("created_at", { ascending: false });

      if (agenciesError) {
        console.error("Error fetching profiles:", agenciesError);
        throw agenciesError;
      }

      // Calculate rating and reviews for each profile
      const profilesWithStats = await Promise.all(
        (agenciesData || []).map(async (profile) => {
          // Get reviews count and average rating
          const { data: reviewsData } = await supabase
            .from("reviews")
            .select("rating")
            .eq("profile_id", profile.id);

          const reviews = reviewsData?.length || 0;
          const rating = reviews > 0
            ? reviewsData!.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews
            : 0;

          return {
            ...profile,
            rating,
            reviews,
          };
        })
      );

      // Fetch stats
      const { count: totalAgencies } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: verifiedAgencies } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("verified", true);

      const { count: totalMessages } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });

      const { count: totalReviews } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true });

      setAgencies(profilesWithStats || []);
      setStats({
        totalAgencies: totalAgencies || 0,
        verifiedAgencies: verifiedAgencies || 0,
        pendingAgencies: (totalAgencies || 0) - (verifiedAgencies || 0),
        totalMessages: totalMessages || 0,
        totalReviews: totalReviews || 0,
      });
    } catch (err) {
      console.error("Error fetching admin data:", err);
      showError("Failed to load data", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const handleVerify = async (agencyId: string, verified: boolean) => {
    try {
      const supabase = createSupabaseClient();
      const agency = agencies.find((a) => a.id === agencyId);
      
      const { error } = await supabase
        .from("profiles")
        .update({ verified })
        .eq("id", agencyId);

      if (error) throw error;

      setAgencies((prev) =>
        prev.map((a) => (a.id === agencyId ? { ...a, verified } : a))
      );
      setStats((prev) => ({
        ...prev,
        verifiedAgencies: verified
          ? prev.verifiedAgencies + 1
          : prev.verifiedAgencies - 1,
        pendingAgencies: verified
          ? prev.pendingAgencies - 1
          : prev.pendingAgencies + 1,
      }));

      // Send verification email if verified
      if (verified && agency && agency.email) {
        try {
          const profileType = (agency.profile_type || "agency") as "agency" | "kol";
          const profileUrl = typeof window !== "undefined" 
            ? `${window.location.origin}/agencies/${agencyId}`
            : `${process.env.NEXT_PUBLIC_APP_URL || "https://crewdeck.xyz"}/agencies/${agencyId}`;
          
          await sendVerificationEmail(
            agency.email,
            agency.name,
            profileType,
            profileUrl
          );
        } catch (emailError) {
          console.error("Failed to send verification email:", emailError);
          // Don't fail the verification if email fails
        }
      }

      showSuccess(
        verified ? "Profile verified" : "Profile unverified",
        `The ${agency?.profile_type === "kol" ? "KOL" : "agency"} has been ${verified ? "verified" : "unverified"}.${verified && agency?.email ? " A congratulatory email has been sent." : ""}`
      );
    } catch (err) {
      showError("Failed to update", err instanceof Error ? err.message : "Unknown error");
    }
  };

  // Removed featured and premium toggles - monetization removed

  const handleDelete = async (agencyId: string, agencyName: string) => {
    setConfirmModalOpen(false);
    setConfirmAction(null);

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", agencyId);

      if (error) throw error;

      setAgencies((prev) => prev.filter((a) => a.id !== agencyId));
      setStats((prev) => ({
        ...prev,
        totalAgencies: prev.totalAgencies - 1,
        verifiedAgencies: agencies.find((a) => a.id === agencyId)?.verified
          ? prev.verifiedAgencies - 1
          : prev.verifiedAgencies,
        pendingAgencies: agencies.find((a) => a.id === agencyId)?.verified
          ? prev.pendingAgencies
          : prev.pendingAgencies - 1,
      }));

      showSuccess("Agency deleted", "The agency has been removed from the platform.");
    } catch (err) {
      showError("Failed to delete", err instanceof Error ? err.message : "Unknown error");
    }
  };

  if (checkingAccess || loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Loading />
      </div>
    );
  }

  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch =
      agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agency.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterVerified === "all" ||
      (filterVerified === "verified" && agency.verified) ||
      (filterVerified === "pending" && !agency.verified);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-semibold mb-2 flex items-center gap-3">
                  <Shield className="h-8 w-8" />
                  Admin Panel
                </h1>
                <p className="text-sm text-foreground/60">
                  Manage profiles (Agencies & KOLs), verify accounts, and moderate content.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const csvData = agencies.map((agency) => ({
                      Name: agency.name,
                      Slug: agency.slug,
                      Status: agency.verified ? "Verified" : "Pending",
                      Type: (agency as any).profile_type || "agency",
                      Rating: agency.rating.toFixed(1),
                      Reviews: agency.reviews,
                      Created: new Date(agency.created_at).toLocaleDateString(),
                    }));
                    exportToCSV(csvData, `agencies-${new Date().toISOString().split("T")[0]}`);
                  }}
                  className="gap-2 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    sessionStorage.removeItem("admin_authenticated");
                    router.push("/");
                  }}
                  className="gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Exit Admin
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
          >
            {[
              {
                label: "Total Agencies",
                value: stats.totalAgencies,
                icon: Building2,
                color: "text-foreground/60",
              },
              {
                label: "Verified",
                value: stats.verifiedAgencies,
                icon: CheckCircle2,
                color: "text-green-500",
              },
              {
                label: "Pending",
                value: stats.pendingAgencies,
                icon: XCircle,
                color: "text-yellow-500",
              },
              {
                label: "Messages",
                value: stats.totalMessages,
                icon: Mail,
                color: "text-foreground/60",
              },
              {
                label: "Reviews",
                value: stats.totalReviews,
                icon: Star,
                color: "text-foreground/60",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-foreground/60">{stat.label}</span>
                </div>
                <div className="text-2xl font-semibold">{stat.value}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search profiles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "verified", "pending"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterVerified(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      filterVerified === filter
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground/70 hover:bg-muted/80 border border-border"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Agencies Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-lg border border-border bg-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Agency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAgencies.map((agency, index) => (
                    <motion.tr
                      key={agency.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-sm font-medium">{agency.name}</div>
                            <div className="text-xs text-foreground/50">{agency.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {agency.verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                            <XCircle className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-foreground/40 capitalize">
                            {(agency as any).profile_type || "agency"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-foreground/20 text-foreground/40" />
                          <span className="text-sm font-medium">{agency.rating.toFixed(1)}</span>
                          <span className="text-xs text-foreground/50">({agency.reviews})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground/60">
                        {new Date(agency.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/agencies/${agency.id}`)}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* Premium and Featured toggles removed - monetization disabled */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setConfirmAction({
                                type: agency.verified ? "unverify" : "verify",
                                agencyId: agency.id,
                                agencyName: agency.name,
                                verified: !agency.verified,
                              });
                              setConfirmModalOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            {agency.verified ? (
                              <XCircle className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setConfirmAction({
                                type: "delete",
                                agencyId: agency.id,
                                agencyName: agency.name,
                              });
                              setConfirmModalOpen(true);
                            }}
                            className="text-foreground/50 hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredAgencies.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No profiles found</h3>
                <p className="text-sm text-foreground/60">
                  {searchQuery || filterVerified !== "all"
                    ? "Try adjusting your search or filters."
                    : "No profiles available."}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => {
          setConfirmModalOpen(false);
          setConfirmAction(null);
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-2 rounded-lg shrink-0 ${
                confirmAction.type === "delete" 
                  ? "bg-red-500/20" 
                  : confirmAction.type === "verify"
                  ? "bg-green-500/20"
                  : "bg-yellow-500/20"
              }`}>
                {confirmAction.type === "delete" ? (
                  <Trash2 className="h-6 w-6 text-red-500" />
                ) : confirmAction.type === "verify" ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-yellow-500" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-semibold mb-2 ${
                  confirmAction.type === "delete" 
                    ? "text-red-500" 
                    : confirmAction.type === "verify"
                    ? "text-green-500"
                    : "text-yellow-500"
                }`}>
                  {confirmAction.type === "delete" 
                    ? "Delete Profile" 
                    : confirmAction.type === "verify"
                    ? "Verify Profile"
                    : "Unverify Profile"}
                </h3>
                <p className="text-sm text-foreground/70 mb-4">
                  {confirmAction.type === "delete" 
                    ? `Are you sure you want to delete "${confirmAction.agencyName}"? This action cannot be undone and will permanently delete the profile, messages, and all associated data.`
                    : confirmAction.type === "verify"
                    ? `Are you sure you want to verify "${confirmAction.agencyName}"? This will make their profile visible to all users and send them a congratulatory email.`
                    : `Are you sure you want to unverify "${confirmAction.agencyName}"? This will hide their profile from public view.`}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmModalOpen(false);
                  setConfirmAction(null);
                }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (confirmAction.type === "delete") {
                    await handleDelete(confirmAction.agencyId, confirmAction.agencyName);
                  } else {
                    await handleVerify(confirmAction.agencyId, confirmAction.verified!);
                  }
                }}
                className={`cursor-pointer ${
                  confirmAction.type === "delete"
                    ? "border-red-500/30 text-red-500 hover:bg-red-500/10"
                    : confirmAction.type === "verify"
                    ? "border-green-500/30 text-green-500 hover:bg-green-500/10"
                    : "border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                }`}
              >
                {confirmAction.type === "delete" 
                  ? "Delete Profile" 
                  : confirmAction.type === "verify"
                  ? "Verify Profile"
                  : "Unverify Profile"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

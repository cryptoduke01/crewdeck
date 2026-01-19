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

// Disable static generation for this page
export const dynamic = 'force-dynamic';

interface Agency {
  id: string;
  name: string;
  slug: string;
  verified: boolean;
  rating: number;
  reviews: number;
  created_at: string;
  user_id: string;
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
        .from("agencies")
        .select("*")
        .order("created_at", { ascending: false });

      if (agenciesError) throw agenciesError;

      // Fetch stats
      const { count: totalAgencies } = await supabase
        .from("agencies")
        .select("*", { count: "exact", head: true });

      const { count: verifiedAgencies } = await supabase
        .from("agencies")
        .select("*", { count: "exact", head: true })
        .eq("verified", true);

      const { count: totalMessages } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });

      const { count: totalReviews } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true });

      setAgencies(agenciesData || []);
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
      const { error } = await supabase
        .from("agencies")
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

      showSuccess(
        verified ? "Agency verified" : "Agency unverified",
        `The agency has been ${verified ? "verified" : "unverified"}.`
      );
    } catch (err) {
      showError("Failed to update", err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleDelete = async (agencyId: string, agencyName: string) => {
    if (!confirm(`Are you sure you want to delete "${agencyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase
        .from("agencies")
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
                  Manage agencies, verify accounts, and moderate content.
                </p>
              </div>
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
                  placeholder="Search agencies..."
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerify(agency.id, !agency.verified)}
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
                            onClick={() => handleDelete(agency.id, agency.name)}
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
                <h3 className="text-lg font-semibold mb-2">No agencies found</h3>
                <p className="text-sm text-foreground/60">
                  {searchQuery || filterVerified !== "all"
                    ? "Try adjusting your search or filters."
                    : "No agencies available."}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

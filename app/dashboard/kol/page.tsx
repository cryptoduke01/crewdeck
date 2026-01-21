"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut, Edit, Mail, TrendingUp, Eye, User, Trash2, AlertTriangle, Copy, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth/context";
import { useMyAgency } from "@/hooks/use-my-agency";
import { Loading } from "@/components/loading";
import { LoadingSpinner } from "@/components/loading-spinner";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast/context";
import { FavoriteButton } from "@/components/favorite-button";

export default function KOLDashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { agency, loading: agencyLoading, refetch } = useMyAgency();
  const router = useRouter();
  const { success: showSuccess } = useToast();
  const [stats, setStats] = useState({
    messages: 0,
    rating: 0,
    views: 0,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  // Redirect KOLs away from agency dashboard
  useEffect(() => {
    if (agency && (agency as any)?.profile_type !== "kol") {
      router.replace("/dashboard/agency");
    }
  }, [agency, router]);

  useEffect(() => {
    async function fetchStats() {
      if (!user || !agency) return;

      try {
        const supabase = createSupabaseClient();

        // Fetch messages count
        const { count: messagesCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", agency.id);

        setStats({
          messages: messagesCount || 0,
          rating: agency.rating || 0,
          views: 0, // TODO: Implement analytics tracking
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }

    fetchStats();
  }, [user, agency]);

  if (authLoading || agencyLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Loading />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const kol = agency as any;

  // If no profile exists, show setup banner
  if (!agencyLoading && !agency) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Setup Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 p-6 rounded-xl border-2 border-foreground/20 bg-gradient-to-br from-card to-card/50 shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-foreground/5 rounded-full blur-3xl -z-10"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-foreground/3 rounded-full blur-2xl -z-10"></div>
              
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-foreground/10">
                    <User className="h-6 w-6 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">Setup Your KOL Profile</h2>
                    <p className="text-sm text-foreground/70 mb-4">
                      Your account will be verified soon. In the meantime, complete and setup your KOL profile to get verified.
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/agency/edit")}
                      className="cursor-pointer gap-2"
                      size="lg"
                    >
                      <Edit className="h-4 w-4" />
                      Setup KOL Profile
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-semibold mb-2">
                  Welcome{kol?.name ? `, ${kol.name}` : ""}
                </h1>
                <p className="text-sm text-foreground/60">
                  Manage your KOL profile and track performance.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  await signOut();
                  router.push("/");
                }}
                className="gap-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </motion.div>

          {/* Setup Banner (if profile incomplete) */}
          {kol && (!kol.description || !kol.twitter_handle) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 p-6 rounded-xl border-2 border-foreground/20 bg-gradient-to-br from-card to-card/50 shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-foreground/5 rounded-full blur-3xl -z-10"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-foreground/3 rounded-full blur-2xl -z-10"></div>
              
              <div className="relative flex items-start gap-4">
                <div className="p-3 rounded-lg bg-foreground/10">
                  <User className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">Complete Your KOL Profile</h2>
                  <p className="text-sm text-foreground/70 mb-4">
                    Add your Twitter handle, follower count, content types, and pricing to increase visibility and attract more clients.
                  </p>
                  <Link href="/dashboard/agency/edit">
                    <Button className="cursor-pointer gap-2">
                      <Edit className="h-4 w-4" />
                      Setup KOL Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Social Stats Card */}
          {kol && kol.twitter_handle && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 p-6 rounded-xl border border-border bg-card"
            >
              <h3 className="text-lg font-semibold mb-4">Social Media Stats</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Twitter className="h-4 w-4 text-foreground/60" />
                    <span className="text-sm text-foreground/60">Twitter</span>
                  </div>
                  <p className="text-lg font-semibold">@{kol.twitter_handle}</p>
                </div>
                {kol.twitter_followers && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="text-sm text-foreground/60 mb-2">Followers</div>
                    <p className="text-lg font-semibold">
                      {kol.twitter_followers.toLocaleString()}
                    </p>
                  </div>
                )}
                {kol.engagement_rate && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="text-sm text-foreground/60 mb-2">Engagement Rate</div>
                    <p className="text-lg font-semibold">
                      {parseFloat(kol.engagement_rate.toString()).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="p-6 rounded-lg border border-border bg-card hover:border-foreground/30 hover:shadow-lg transition-all group cursor-default"
            >
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Eye className="h-5 w-5 text-foreground/40 group-hover:text-foreground transition-colors" />
                </motion.div>
                <span className="text-sm font-medium text-foreground/60">Profile views</span>
              </div>
              <div className="text-2xl font-semibold">{stats.views}</div>
              <p className="text-xs text-foreground/50 mt-1">This month</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="p-6 rounded-lg border border-border bg-card hover:border-foreground/30 hover:shadow-lg transition-all group cursor-default"
            >
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Mail className="h-5 w-5 text-foreground/40 group-hover:text-foreground transition-colors" />
                </motion.div>
                <span className="text-sm font-medium text-foreground/60">Messages</span>
              </div>
              <div className="text-2xl font-semibold">{stats.messages}</div>
              <p className="text-xs text-foreground/50 mt-1">Total inquiries</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="p-6 rounded-lg border border-border bg-card hover:border-foreground/30 hover:shadow-lg transition-all group cursor-default"
            >
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <TrendingUp className="h-5 w-5 text-foreground/40 group-hover:text-foreground transition-colors" />
                </motion.div>
                <span className="text-sm font-medium text-foreground/60">Rating</span>
              </div>
              <div className="text-2xl font-semibold">
                {stats.rating > 0 ? stats.rating.toFixed(1) : "-"}
              </div>
              <p className="text-xs text-foreground/50 mt-1">
                {kol?.reviews ? `${kol.reviews} reviews` : "No reviews yet"}
              </p>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="p-6 rounded-lg border border-border bg-card"
          >
            <h2 className="text-xl font-semibold mb-4">Quick actions</h2>
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <Link href="/dashboard/agency/edit">
                  <Button variant="outline" className="w-full justify-start gap-2 cursor-pointer">
                    <Edit className="h-4 w-4" />
                    Edit profile
                  </Button>
                </Link>
                <Link href="/dashboard/agency/messages">
                  <Button variant="outline" className="w-full justify-start gap-2 cursor-pointer">
                    <Mail className="h-4 w-4" />
                    View messages
                  </Button>
                </Link>
              </div>
              {kol && (
                <div className="flex items-center gap-2">
                  <Link href={`/agencies/${kol.id}`} className="flex-1">
                    <Button variant="outline" className="w-full justify-start gap-2 cursor-pointer">
                      <Eye className="h-4 w-4" />
                      View Profile
                    </Button>
                  </Link>
                  <FavoriteButton agencyId={kol.id} />
                </div>
              )}
            </div>
          </motion.div>

          {/* Delete Account Section */}
          {kol && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 p-6 rounded-lg border-2 border-red-500/20 bg-red-500/5"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-red-500/20 shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-red-500">Danger Zone</h3>
                    <p className="text-sm text-foreground/70">
                      Once you delete your account, there is no going back. This will permanently delete your KOL profile, messages, and all associated data.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteModalOpen(true)}
                    className="cursor-pointer gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Delete Account Modal */}
          {deleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => {
              setDeleteModalOpen(false);
              setDeleteConfirmText("");
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-2 rounded-lg bg-red-500/20 shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-red-500">Delete Account</h3>
                    <p className="text-sm text-foreground/70 mb-4">
                      Are you sure you want to delete your account? This action cannot be undone.
                    </p>
                    <p className="text-sm text-foreground/70 mb-4">
                      This will permanently delete your KOL profile, messages, and all associated data.
                    </p>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-foreground/80 mb-2 block">
                        Type <span className="font-mono text-red-500">DELETE</span> to confirm:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                        placeholder="Type DELETE"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeleteModalOpen(false);
                      setDeleteConfirmText("");
                    }}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (deleteConfirmText !== "DELETE") {
                        alert("Please type DELETE to confirm");
                        return;
                      }

                      setDeleting(true);
                      try {
                        const response = await fetch("/api/account/delete", {
                          method: "POST",
                        });

                        if (!response.ok) {
                          const data = await response.json();
                          throw new Error(data.error || "Failed to delete account");
                        }

                        setDeleteModalOpen(false);
                        await signOut();
                        router.push("/");
                      } catch (error) {
                        alert("Failed to delete account. Please try again or contact support.");
                        console.error("Delete account error:", error);
                        setDeleting(false);
                      }
                    }}
                    disabled={deleteConfirmText !== "DELETE" || deleting}
                    className="cursor-pointer border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut, Edit, Mail, TrendingUp, Eye, Sparkles, Crown, ArrowUpRight, Zap, CheckCircle2, Wallet, Trash2, AlertTriangle, Briefcase, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth/context";
import { useMyAgency } from "@/hooks/use-my-agency";
import { Loading } from "@/components/loading";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast/context";

export default function AgencyDashboardPage() {
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  // Check for payment success
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success") {
        const plan = params.get("plan");
        showSuccess("Payment successful!", `Your ${plan} plan is now active.`);
        // Clean URL
        router.replace("/dashboard/agency");
        refetch(); // Refresh agency data
      }
    }
  }, [router, refetch, showSuccess]);

  // Refetch agency data when user is available (after auth loads)
  useEffect(() => {
    if (user && !authLoading) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]); // Run when user/auth state changes

  useEffect(() => {
    async function fetchStats() {
      if (!user || !agency) return;

      try {
        const supabase = createSupabaseClient();

        // Fetch messages count
        const { count: messagesCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("agency_id", agency.id);

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

  // If no agency exists, show setup banner
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
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-foreground/5 rounded-full blur-3xl -z-10"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-foreground/3 rounded-full blur-2xl -z-10"></div>
              
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-foreground/10">
                    <Sparkles className="h-6 w-6 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">Setup Your Agency Profile</h2>
                    <p className="text-sm text-foreground/70 mb-4">
                      Complete your agency profile to start receiving inquiries and showcase your work. 
                      Add your services, portfolio, and pricing to get discovered by potential clients.
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/agency/edit")}
                      className="cursor-pointer gap-2"
                      size="lg"
                    >
                      <Edit className="h-4 w-4" />
                      Setup Agency Profile
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Setup Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <h3 className="text-xl font-semibold mb-4">Payment Setup</h3>
              <p className="text-sm text-foreground/60 mb-6">
                Configure your payment methods to accept payments from clients. We support both crypto and fiat payments.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Solana Payment */}
                <div className="p-4 rounded-lg border-2 border-foreground/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 hover:border-foreground/40 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Zap className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Solana Payments</h4>
                      <p className="text-xs text-foreground/60">Fastest & Most Reliable</p>
                    </div>
                  </div>
                  <ul className="text-xs text-foreground/70 space-y-1 mt-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Instant settlements
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Low transaction fees
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Global accessibility
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 w-full cursor-pointer"
                    onClick={() => router.push("/dashboard/payments?method=solana")}
                  >
                    Setup Solana
                  </Button>
                </div>

                {/* Fiat Payment */}
                <div className="p-4 rounded-lg border-2 border-border hover:border-foreground/30 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-foreground/10">
                      <TrendingUp className="h-5 w-5 text-foreground/60" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Fiat Payments</h4>
                      <p className="text-xs text-foreground/60">Traditional Methods</p>
                    </div>
                  </div>
                  <ul className="text-xs text-foreground/70 space-y-1 mt-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Credit/Debit cards
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Bank transfers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      PayPal & Stripe
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 w-full cursor-pointer"
                    onClick={() => router.push("/dashboard/payments?method=fiat")}
                  >
                    Setup Fiat
                  </Button>
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
                  Welcome{agency ? `, ${agency.name}` : ""}
                </h1>
                <p className="text-sm text-foreground/60">
                  Manage your agency profile and track performance.
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
          {agency && (!agency.description || !agency.website || agency.services?.length === 0) && (
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
                  <Briefcase className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">Setup Your Agency Profile</h2>
                  <p className="text-sm text-foreground/70 mb-4">
                    Complete your agency profile to increase visibility and attract more clients. Add your services, portfolio, and pricing.
                  </p>
                  <Link href="/dashboard/agency/edit">
                    <Button className="cursor-pointer gap-2">
                      <Edit className="h-4 w-4" />
                      Setup Agency Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment Setup Section (always show if wallet not configured) */}
          {agency && !agency.walletAddress && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8 p-6 rounded-xl border-2 border-border bg-card shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Payment Setup</h3>
                  <p className="text-sm text-foreground/60">
                    Configure your Solana wallet to receive payments from clients.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-medium text-orange-500">Not Setup</span>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border-2 border-foreground/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <img 
                      src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" 
                      alt="Solana" 
                      className="h-5 w-5"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                    <Zap className="h-5 w-5 text-purple-500" style={{ display: 'none' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold">Solana Wallet</h4>
                    <p className="text-xs text-foreground/60">Fastest & Most Reliable</p>
                  </div>
                </div>
                <p className="text-sm text-foreground/70 mb-4">
                  Set up your Solana wallet address to receive instant payments from clients. 
                  Payments settle in seconds with ultra-low fees.
                </p>
                <Button 
                  onClick={() => router.push("/dashboard/payments")}
                  className="cursor-pointer gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  Setup Wallet Address
                </Button>
              </div>
            </motion.div>
          )}

          {/* Wallet Address Display (if configured) */}
          {agency && agency.walletAddress && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 p-6 rounded-xl border-2 border-border bg-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Payment Setup</h3>
                  <p className="text-sm text-foreground/60">
                    Your Solana wallet is configured to receive payments.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium text-green-500">Configured</span>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/60 mb-1">Wallet Address</p>
                    <p className="text-sm font-mono text-foreground/80 break-all">
                      {agency.walletAddress}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await navigator.clipboard.writeText(agency.walletAddress || "");
                        alert("Wallet address copied to clipboard!");
                      }}
                      className="cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/dashboard/payments")}
                      className="cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Plan Status */}
          {agency && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 p-6 rounded-xl border-2 border-border bg-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Current Plan</h3>
                  <div className="flex items-center gap-3">
                    {agency.premium ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium">
                        <Crown className="h-4 w-4" />
                        Premium
                      </span>
                    ) : agency.featured ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 text-sm font-medium">
                        <Sparkles className="h-4 w-4" />
                        Featured
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-foreground/60 text-sm font-medium">
                        Free
                      </span>
                    )}
                    {!agency.premium && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-2 cursor-pointer"
                        onClick={() => router.push("/dashboard/upgrade")}
                      >
                        Upgrade
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
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
                {agency?.reviews ? `${agency.reviews} reviews` : "No reviews yet"}
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
            <div className="grid sm:grid-cols-3 gap-3">
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
              {agency && (
                <Link href={`/agencies/${agency.id}`}>
                  <Button variant="outline" className="w-full justify-start gap-2 cursor-pointer">
                    <Eye className="h-4 w-4" />
                    View public profile
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Delete Account Section */}
          {agency && (
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
                      Once you delete your account, there is no going back. This will permanently delete your agency profile, messages, and all associated data.
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => {
              setDeleteModalOpen(false);
              setDeleteConfirmText("");
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border-2 border-red-500/30 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
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
                      This will permanently delete your agency profile, messages, and all associated data.
                    </p>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-foreground/80 mb-2 block">
                        Type <span className="font-mono text-red-500">DELETE</span> to confirm:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
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
                      }
                    }}
                    disabled={deleteConfirmText !== "DELETE"}
                    className="cursor-pointer border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
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

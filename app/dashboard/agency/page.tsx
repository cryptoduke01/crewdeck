"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut, Edit, Mail, TrendingUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth/context";
import { useMyAgency } from "@/hooks/use-my-agency";
import { Loading } from "@/components/loading";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function AgencyDashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { agency, loading: agencyLoading, refetch } = useMyAgency();
  const router = useRouter();
  const [stats, setStats] = useState({
    messages: 0,
    rating: 0,
    views: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

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

  // If no agency exists, show create agency option
  if (!agencyLoading && !agency) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center p-8 rounded-lg border border-border bg-card"
            >
              <h1 className="text-2xl font-semibold mb-3">No agency profile found</h1>
              <p className="text-sm text-foreground/60 mb-6">
                Create your agency profile to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.push("/dashboard/agency/edit")}
                  className="cursor-pointer"
                >
                  Create Agency Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await signOut();
                    router.push("/");
                  }}
                  className="cursor-pointer"
                >
                  Sign out
                </Button>
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

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-6 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <Eye className="h-5 w-5 text-foreground/40" />
                <span className="text-sm font-medium text-foreground/60">Profile views</span>
              </div>
              <div className="text-2xl font-semibold">{stats.views}</div>
              <p className="text-xs text-foreground/50 mt-1">This month</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="p-6 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-foreground/40" />
                <span className="text-sm font-medium text-foreground/60">Messages</span>
              </div>
              <div className="text-2xl font-semibold">{stats.messages}</div>
              <p className="text-xs text-foreground/50 mt-1">Total inquiries</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="p-6 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-foreground/40" />
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
        </div>
      </div>
    </div>
  );
}

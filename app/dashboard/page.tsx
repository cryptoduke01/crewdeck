"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useMyAgency } from "@/hooks/use-my-agency";
import { Loading } from "@/components/loading";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { agency, loading: agencyLoading } = useMyAgency();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading
    if (authLoading || agencyLoading) {
      return;
    }

    // If no user, redirect to login
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Only redirect once - check current path to prevent loops
    if (typeof window === "undefined") return;
    const currentPath = window.location.pathname;
    if (currentPath !== "/dashboard") {
      return; // Already redirected
    }

    // Get profile type from agency or user metadata
    let profileType = "agency";
    if (agency) {
      profileType = (agency as any)?.profile_type || "agency";
    } else {
      // Use user metadata as fallback
      profileType = (user.user_metadata?.profile_type as string) || "agency";
    }

    // Longer delay to ensure session is fully established and prevent rate limiting
    const redirectTimer = setTimeout(() => {
      // Redirect based on profile type
      if (profileType === "kol") {
        if (agency) {
          router.replace("/dashboard/kol");
        } else {
          router.replace("/dashboard/kol/edit");
        }
      } else {
        if (agency) {
          router.replace("/dashboard/agency");
        } else {
          router.replace("/dashboard/agency/edit");
        }
      }
    }, 500); // Increased delay to prevent rate limiting

    return () => clearTimeout(redirectTimer);
  }, [user, authLoading, agency, agencyLoading, router]);

  return (
    <div className="min-h-screen bg-background">
      <Loading />
    </div>
  );
}

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

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (agency) {
      // Redirect based on profile type
      const profileType = (agency as any)?.profile_type || "agency";
      if (profileType === "kol") {
        router.replace("/dashboard/kol");
      } else {
        router.replace("/dashboard/agency");
      }
    } else {
      // No profile yet, default to agency edit page
      router.replace("/dashboard/agency/edit");
    }
  }, [user, authLoading, agency, agencyLoading, router]);

  return (
    <div className="min-h-screen bg-background">
      <Loading />
    </div>
  );
}

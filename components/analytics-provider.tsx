"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analytics } from "@/lib/analytics/client";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Track page views on route changes
    if (pathname) {
      analytics.page(pathname);
    }
  }, [pathname]);

  return <>{children}</>;
}

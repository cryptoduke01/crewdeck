"use client";

import { motion } from "framer-motion";

export function AgencyCardSkeleton() {
  return (
    <div className="p-6 rounded-lg border border-border bg-card h-full flex flex-col">
      <div className="mb-4">
        <div className="h-6 bg-muted rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
      </div>
      <div className="h-5 bg-muted rounded w-20 mb-4 animate-pulse"></div>
      <div className="h-4 bg-muted rounded w-32 mb-4 animate-pulse"></div>
      <div className="space-y-2 mb-4 flex-1">
        <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
        <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
      </div>
      <div className="h-10 bg-muted rounded w-full animate-pulse"></div>
    </div>
  );
}

export function AgencyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <AgencyCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

export function PortfolioSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-5 rounded-lg border border-border bg-card">
          <div className="h-48 bg-muted rounded-lg mb-3 animate-pulse"></div>
          <div className="h-5 bg-muted rounded w-3/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-full mb-1 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

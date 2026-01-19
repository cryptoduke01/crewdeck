"use client";

import { motion } from "framer-motion";

export function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <motion.div
      className={`w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full ${className || ""}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
    />
  );
}

"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-3 h-3 border",
  md: "w-4 h-4 border-2",
  lg: "w-5 h-5 border-2",
};

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  return (
    <motion.div
      className={`${sizeClasses[size]} border-foreground/20 border-t-foreground rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
    />
  );
}

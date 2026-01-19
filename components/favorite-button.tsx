"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";
import { motion } from "framer-motion";

interface FavoriteButtonProps {
  agencyId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function FavoriteButton({ agencyId, variant = "ghost", size = "default" }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(agencyId);
      }}
      className="cursor-pointer"
    >
      <motion.div
        animate={{ scale: isFavorite(agencyId) ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`h-4 w-4 ${
            isFavorite(agencyId)
              ? "fill-red-500 text-red-500"
              : "fill-none text-foreground/40"
          }`}
        />
      </motion.div>
    </Button>
  );
}

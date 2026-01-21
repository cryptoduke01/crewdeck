"use client";

import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";
import { motion } from "framer-motion";

interface FavoriteButtonProps {
  agencyId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function FavoriteButton({ agencyId, variant = "outline", size = "default" }: FavoriteButtonProps) {
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
      className="cursor-pointer group-hover:bg-foreground group-hover:text-background hover:outline hover:outline-2 hover:outline-foreground/20 transition-all"
      title={isFavorite(agencyId) ? "Remove bookmark" : "Bookmark agency"}
    >
      <motion.div
        animate={{ scale: isFavorite(agencyId) ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Bookmark
          className={`h-4 w-4 ${
            isFavorite(agencyId)
              ? "fill-foreground text-foreground"
              : "fill-none text-foreground/40"
          }`}
        />
      </motion.div>
    </Button>
  );
}

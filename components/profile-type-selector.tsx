"use client";

import { Building2, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProfileTypeSelectorProps {
  selectedType: "agency" | "kol" | null;
  onSelect: (type: "agency" | "kol") => void;
}

export function ProfileTypeSelector({ selectedType, onSelect }: ProfileTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <motion.button
        type="button"
        onClick={() => onSelect("agency")}
        className={cn(
          "relative flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all duration-200 min-h-[160px]",
          selectedType === "agency"
            ? "border-foreground bg-foreground/10 shadow-md"
            : "border-border bg-card hover:border-foreground/50"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Building2 
          className={cn(
            "h-8 w-8 mb-4", 
            selectedType === "agency" ? "text-foreground" : "text-foreground/70"
          )} 
        />
        <h3 className={cn(
          "font-semibold text-lg mb-2 text-center",
          selectedType === "agency" ? "text-foreground" : "text-foreground/90"
        )}>
          I'm an Agency
        </h3>
        <p className="text-sm text-foreground/60 text-center max-w-[200px]">
          A team offering full services
        </p>
        {selectedType === "agency" && (
          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-background" />
          </div>
        )}
      </motion.button>

      <motion.button
        type="button"
        onClick={() => onSelect("kol")}
        className={cn(
          "relative flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all duration-200 min-h-[160px]",
          selectedType === "kol"
            ? "border-foreground bg-foreground/10 shadow-md"
            : "border-border bg-card hover:border-foreground/50"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <User 
          className={cn(
            "h-8 w-8 mb-4", 
            selectedType === "kol" ? "text-foreground" : "text-foreground/70"
          )} 
        />
        <h3 className={cn(
          "font-semibold text-lg mb-2 text-center",
          selectedType === "kol" ? "text-foreground" : "text-foreground/90"
        )}>
          I'm a KOL/Influencer
        </h3>
        <p className="text-sm text-foreground/60 text-center max-w-[200px]">
          Individual offering content/reach
        </p>
        {selectedType === "kol" && (
          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-background" />
          </div>
        )}
      </motion.button>
    </div>
  );
}

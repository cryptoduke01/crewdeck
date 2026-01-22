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
    <div className="space-y-3">
      <motion.button
        type="button"
        onClick={() => onSelect("agency")}
        className={cn(
          "relative w-full flex flex-row items-center gap-4 px-6 py-4 rounded-lg border-2 transition-all duration-200 text-left",
          selectedType === "agency"
            ? "border-foreground bg-foreground/10"
            : "border-border bg-background hover:border-foreground/50"
        )}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex-shrink-0">
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
            selectedType === "agency"
              ? "border-foreground bg-foreground"
              : "border-foreground/40"
          )}>
            {selectedType === "agency" && (
              <div className="w-2.5 h-2.5 rounded-full bg-background" />
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <Building2 
            className={cn(
              "h-5 w-5", 
              selectedType === "agency" ? "text-foreground" : "text-foreground/70"
            )} 
          />
        </div>
        <div className="flex-1">
          <h3 className={cn(
            "font-semibold text-base",
            selectedType === "agency" ? "text-foreground" : "text-foreground/90"
          )}>
            I'm an Agency
          </h3>
          <p className="text-sm text-foreground/60 mt-0.5">
            A team offering full services
          </p>
        </div>
      </motion.button>

      <motion.button
        type="button"
        onClick={() => onSelect("kol")}
        className={cn(
          "relative w-full flex flex-row items-center gap-4 px-6 py-4 rounded-lg border-2 transition-all duration-200 text-left",
          selectedType === "kol"
            ? "border-foreground bg-foreground/10"
            : "border-border bg-background hover:border-foreground/50"
        )}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex-shrink-0">
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
            selectedType === "kol"
              ? "border-foreground bg-foreground"
              : "border-foreground/40"
          )}>
            {selectedType === "kol" && (
              <div className="w-2.5 h-2.5 rounded-full bg-background" />
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <User 
            className={cn(
              "h-5 w-5", 
              selectedType === "kol" ? "text-foreground" : "text-foreground/70"
            )} 
          />
        </div>
        <div className="flex-1">
          <h3 className={cn(
            "font-semibold text-base",
            selectedType === "kol" ? "text-foreground" : "text-foreground/90"
          )}>
            I'm a KOL/Influencer
          </h3>
          <p className="text-sm text-foreground/60 mt-0.5">
            Individual offering content/reach
          </p>
        </div>
      </motion.button>
    </div>
  );
}

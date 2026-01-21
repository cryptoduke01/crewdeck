"use client";

import { Building2, User } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTypeSelectorProps {
  selectedType: "agency" | "kol" | null;
  onSelect: (type: "agency" | "kol") => void;
}

export function ProfileTypeSelector({ selectedType, onSelect }: ProfileTypeSelectorProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      <motion.button
        type="button"
        onClick={() => onSelect("agency")}
        className={`p-6 rounded-xl border-2 text-left transition-all cursor-pointer ${
          selectedType === "agency"
            ? "border-foreground bg-foreground/10"
            : "border-border bg-card hover:border-foreground/50"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${
            selectedType === "agency" ? "bg-foreground/20" : "bg-foreground/10"
          }`}>
            <Building2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">I'm an Agency</h3>
            <p className="text-sm text-foreground/70">
              A team offering full marketing services (content, community, paid ads, etc.)
            </p>
          </div>
          {selectedType === "agency" && (
            <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-background" />
            </div>
          )}
        </div>
      </motion.button>

      <motion.button
        type="button"
        onClick={() => onSelect("kol")}
        className={`p-6 rounded-xl border-2 text-left transition-all cursor-pointer ${
          selectedType === "kol"
            ? "border-foreground bg-foreground/10"
            : "border-border bg-card hover:border-foreground/50"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${
            selectedType === "kol" ? "bg-foreground/20" : "bg-foreground/10"
          }`}>
            <User className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">I'm a KOL/Influencer</h3>
            <p className="text-sm text-foreground/70">
              An individual offering influencer marketing, content creation, and reviews
            </p>
          </div>
          {selectedType === "kol" && (
            <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-background" />
            </div>
          )}
        </div>
      </motion.button>
    </div>
  );
}

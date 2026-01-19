"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type SortOption } from "@/hooks/use-agencies";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  niches: string[];
  locations: string[];
  availableServices: string[];
  sortOptions: { value: SortOption; label: string }[];
  selectedNiche: string;
  selectedLocation: string;
  selectedServices: string[];
  minPrice: number | undefined;
  maxPrice: number | undefined;
  sortBy: SortOption;
  onNicheChange: (niche: string) => void;
  onLocationChange: (location: string) => void;
  onServiceToggle: (service: string) => void;
  onMinPriceChange: (price: number | undefined) => void;
  onMaxPriceChange: (price: number | undefined) => void;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function FilterModal({
  isOpen,
  onClose,
  niches,
  locations,
  availableServices,
  sortOptions,
  selectedNiche,
  selectedLocation,
  selectedServices,
  minPrice,
  maxPrice,
  sortBy,
  onNicheChange,
  onLocationChange,
  onServiceToggle,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}: FilterModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-4 top-20 bottom-auto max-h-[85vh] overflow-y-auto bg-card border border-border rounded-lg shadow-lg z-[9999] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-foreground/60" />
                <h2 className="text-xl font-semibold">Filters</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Category */}
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-3 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {niches.map((niche) => (
                    <button
                      key={niche}
                      onClick={() => onNicheChange(niche)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                        selectedNiche === niche
                          ? "bg-foreground text-background"
                          : "bg-muted text-foreground/70 hover:bg-muted/80 border border-border"
                      }`}
                    >
                      {niche}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-3 block">Price Range</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min $"
                    value={minPrice || ""}
                    onChange={(e) => onMinPriceChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                  <span className="text-sm text-foreground/40">-</span>
                  <input
                    type="number"
                    placeholder="Max $"
                    value={maxPrice || ""}
                    onChange={(e) => onMaxPriceChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Services */}
              {availableServices.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-3 block">Services</label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 border border-border rounded-lg bg-background">
                    {availableServices.map((service) => (
                      <button
                        key={service}
                        onClick={() => onServiceToggle(service)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          selectedServices.includes(service)
                            ? "bg-foreground text-background"
                            : "bg-muted text-foreground/70 hover:bg-muted/80 border border-border"
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Location and Sort */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-3 block">Location</label>
                  <Select value={selectedLocation} onValueChange={onLocationChange}>
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-3 block">Sort by</label>
                  <Select value={sortBy} onValueChange={onSortChange}>
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={onClearFilters}
                    className="flex-1 cursor-pointer"
                  >
                    Clear all
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  className="flex-1 cursor-pointer"
                >
                  Apply filters
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

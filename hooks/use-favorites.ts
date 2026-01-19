"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "crewdeck_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  }, []);

  const toggleFavorite = (agencyId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(agencyId)
        ? prev.filter((id) => id !== agencyId)
        : [...prev, agencyId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (agencyId: string) => {
    return favorites.includes(agencyId);
  };

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: favorites.length,
  };
}

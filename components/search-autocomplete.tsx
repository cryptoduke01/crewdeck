"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseClient } from "@/lib/supabase/client";

interface SearchSuggestion {
  type: "agency" | "service" | "niche";
  text: string;
  id?: string;
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  placeholder?: string;
}

const MAX_RECENT_SEARCHES = 5;
const STORAGE_KEY = "crewdeck_recent_searches";

export function SearchAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search agencies, services, or niches...",
}: SearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading recent searches:", err);
    }
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const supabase = createSupabaseClient();
        const searchTerm = value.toLowerCase().trim();

        // Fetch agencies matching search
        const { data: agenciesData } = await supabase
          .from("agencies")
          .select("id, name, niche")
          .or(`name.ilike.%${searchTerm}%,niche.ilike.%${searchTerm}%`)
          .eq("verified", true)
          .limit(3);

        // Fetch services matching search
        const { data: servicesData } = await supabase
          .from("services")
          .select("name")
          .ilike("name", `%${searchTerm}%`)
          .limit(3);

        const suggestionsList: SearchSuggestion[] = [];

        // Add agency suggestions
        if (agenciesData) {
          agenciesData.forEach((agency: any) => {
            suggestionsList.push({
              type: "agency",
              text: agency.name,
              id: agency.id,
            });
          });
        }

        // Add service suggestions (unique)
        if (servicesData) {
          const uniqueServices = Array.from(new Set(servicesData.map((s: any) => s.name)));
          uniqueServices.slice(0, 3).forEach((service) => {
            suggestionsList.push({
              type: "service",
              text: service,
            });
          });
        }

        // Add niche suggestions if search matches common niches
        const niches = ["DeFi", "NFT", "Web3", "Gaming", "Metaverse"];
        niches.forEach((niche) => {
          if (niche.toLowerCase().includes(searchTerm)) {
            suggestionsList.push({
              type: "niche",
              text: niche,
            });
          }
        });

        setSuggestions(suggestionsList.slice(0, 8));
        setShowSuggestions(suggestionsList.length > 0);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    onSelect(suggestion.text);
    setShowSuggestions(false);
    inputRef.current?.blur();

    // Save to recent searches
    saveRecentSearch(suggestion.text);
  };

  const handleRecentSearch = (search: string) => {
    onChange(search);
    onSelect(search);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const saveRecentSearch = (search: string) => {
    try {
      const trimmed = search.trim();
      if (!trimmed) return;

      const updated = [
        trimmed,
        ...recentSearches.filter((s) => s !== trimmed),
      ].slice(0, MAX_RECENT_SEARCHES);

      setRecentSearches(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Error saving recent search:", err);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getSuggestionIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "agency":
        return "🏢";
      case "service":
        return "⚙️";
      case "niche":
        return "🏷️";
      default:
        return "🔍";
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/40" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (value.length >= 2 || recentSearches.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="w-full h-11 pl-11 pr-4 rounded-lg border border-border bg-card text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5 text-foreground/40" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-border bg-card shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {loading && (
              <div className="p-4 text-center text-sm text-foreground/60">
                Searching...
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-medium text-foreground/50 uppercase tracking-wider">
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.text}-${index}`}
                    onClick={() => handleSelect(suggestion)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <span className="text-base">{getSuggestionIcon(suggestion.type)}</span>
                    <span className="flex-1">{suggestion.text}</span>
                    <span className="text-xs text-foreground/40 capitalize">{suggestion.type}</span>
                  </button>
                ))}
              </div>
            )}

            {!loading && suggestions.length === 0 && value.length >= 2 && (
              <div className="p-4 text-center text-sm text-foreground/60">
                No suggestions found
              </div>
            )}

            {!loading && suggestions.length === 0 && value.length < 2 && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                    Recent Searches
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(search)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <Clock className="h-4 w-4 text-foreground/40" />
                    <span className="flex-1">{search}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

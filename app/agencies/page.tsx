"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Star, 
  MapPin, 
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAgencies, type SortOption } from "@/hooks/use-agencies";
import { Loading, LoadingSpinner } from "@/components/loading";
import { AgencyGridSkeleton } from "@/components/skeleton";
import { Pagination } from "@/components/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { FavoriteButton } from "@/components/favorite-button";
import { analytics } from "@/lib/analytics/client";
import { useDebounce } from "@/hooks/use-debounce";
import { FilterModal } from "@/components/filter-modal";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { SlidersHorizontal } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { highlightText } from "@/lib/search/highlight";

const niches = ["All", "DeFi", "NFT", "Web3", "Gaming", "Metaverse"];
const locations = ["All", "Remote", "New York, US", "San Francisco, US", "Los Angeles, US", "Austin, US", "Seattle, US"];
const sortOptions: { value: SortOption; label: string }[] = [
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviews" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

export default function AgenciesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfileType, setSelectedProfileType] = useState<"all" | "agency" | "kol">("all");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);

  const { agencies, loading, error } = useAgencies({
    profileType: selectedProfileType,
    niche: selectedNiche,
    searchQuery: debouncedSearchQuery || undefined,
    location: selectedLocation,
    minPrice: debouncedMinPrice,
    maxPrice: debouncedMaxPrice,
    services: selectedServices.length > 0 ? selectedServices : undefined,
    sortBy,
  });

  useEffect(() => {
    analytics.page("Agencies Directory", {
      niche: selectedNiche,
      location: selectedLocation,
      hasSearchQuery: !!debouncedSearchQuery,
      sortBy,
    });
  }, [selectedNiche, selectedLocation, debouncedSearchQuery, sortBy]);

  const handleNicheChange = (niche: string) => {
    setSelectedNiche(niche);
    analytics.track("Filter Changed", {
      filterType: "niche",
      value: niche,
    });
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    analytics.track("Filter Changed", {
      filterType: "location",
      value: location,
    });
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    analytics.track("Sort Changed", {
      value: sort,
    });
  };

  // Fetch available services on mount
  useEffect(() => {
    async function fetchServices() {
      try {
        const supabase = createSupabaseClient();
        // Get all unique services from verified agencies
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id")
          .eq("verified", true)
          .eq("profile_type", "agency"); // Only fetch services from agencies
        
        if (profilesData && profilesData.length > 0) {
          const profileIds = profilesData.map(p => p.id);
          const { data: servicesData } = await supabase
            .from("services")
            .select("name")
            .in("profile_id", profileIds);
          
          if (servicesData) {
            const uniqueServices = Array.from(new Set(servicesData.map(s => s.name))).sort();
            setAvailableServices(uniqueServices);
          }
        }
      } catch (err) {
        console.error("Error fetching services:", err);
      }
    }
    fetchServices();
  }, []);

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
    analytics.track("Filter Changed", {
      filterType: "service",
      value: service,
    });
  };

  const hasActiveFilters = Boolean(selectedProfileType !== "all" || selectedNiche !== "All" || selectedLocation !== "All" || searchQuery || minPrice !== undefined || maxPrice !== undefined || selectedServices.length > 0 || sortBy !== "rating");

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedProfileType("all");
    setSelectedNiche("All");
    setSelectedLocation("All");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSelectedServices([]);
    setSortBy("rating");
    analytics.track("Filters Cleared");
  };

  // Pagination
  const { paginatedItems, currentPage, totalPages, goToPage } = usePagination(agencies, 12);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "k",
      ctrl: true,
      action: () => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      },
      description: "Focus search",
    },
    {
      key: "/",
      action: () => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (document.activeElement !== searchInput) {
          searchInput?.focus();
        }
      },
      description: "Focus search",
    },
  ]);

  if (loading && agencies.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <AgencyGridSkeleton count={6} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Stacked layers background effect */}
        <div className="absolute inset-0 -z-10 opacity-3">
          <div className="absolute top-10 left-10 w-96 h-96 bg-foreground rounded-3xl rotate-6 blur-3xl"></div>
          <div className="absolute top-20 right-20 w-80 h-80 bg-foreground rounded-3xl -rotate-12 blur-3xl"></div>
        </div>
        
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                  {selectedProfileType === "kol" ? "KOLs & Influencers" : selectedProfileType === "agency" ? "Marketing Agencies" : "Browse Profiles"}
                </h1>
                <p className="text-lg text-foreground/70 max-w-2xl">
                  {selectedProfileType === "kol" 
                    ? "Browse crypto-native influencers and content creators." 
                    : selectedProfileType === "agency"
                    ? "Browse vetted marketing agencies. Compare services, portfolios, and reviews."
                    : "Browse vetted marketing agencies and KOLs. Compare services, portfolios, and reviews."}
                </p>
              </div>
              {/* Profile Type Selector */}
              <div className="flex gap-2 border border-border rounded-lg p-1 bg-card">
                <button
                  onClick={() => {
                    setSelectedProfileType("all");
                    analytics.track("Profile Type Filter", { type: "all" });
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    selectedProfileType === "all"
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setSelectedProfileType("agency");
                    analytics.track("Profile Type Filter", { type: "agency" });
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    selectedProfileType === "agency"
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Agencies
                </button>
                <button
                  onClick={() => {
                    setSelectedProfileType("kol");
                    analytics.track("Profile Type Filter", { type: "kol" });
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    selectedProfileType === "kol"
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  KOLs
                </button>
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <div className="mb-10 space-y-4">
            {/* Search Bar and Filter Button */}
            <div className="flex gap-3 items-center">
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                onSelect={(value) => {
                  setSearchQuery(value);
                  analytics.track("Search Performed", {
                    query: value,
                    source: "autocomplete",
                  });
                }}
                placeholder="Search agencies, services, or niches..."
              />
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(true)}
                className="gap-2 cursor-pointer relative"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center">
                    {[
                      selectedNiche !== "All" ? 1 : 0,
                      selectedLocation !== "All" ? 1 : 0,
                      minPrice !== undefined ? 1 : 0,
                      maxPrice !== undefined ? 1 : 0,
                      selectedServices.length,
                      sortBy !== "rating" ? 1 : 0,
                      selectedProfileType !== "all" ? 1 : 0,
                    ].reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </Button>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-foreground/60">Active filters:</span>
                {selectedProfileType !== "all" && (
                  <span className="px-2 py-1 rounded text-xs bg-muted text-foreground/70 border border-border">
                    {selectedProfileType === "agency" ? "Agencies" : "KOLs"}
                  </span>
                )}
                {selectedNiche !== "All" && (
                  <span className="px-2 py-1 rounded text-xs bg-muted text-foreground/70 border border-border">
                    {selectedNiche}
                  </span>
                )}
                {selectedLocation !== "All" && (
                  <span className="px-2 py-1 rounded text-xs bg-muted text-foreground/70 border border-border">
                    {selectedLocation}
                  </span>
                )}
                {(minPrice !== undefined || maxPrice !== undefined) && (
                  <span className="px-2 py-1 rounded text-xs bg-muted text-foreground/70 border border-border">
                    ${minPrice || "0"} - ${maxPrice || "∞"}
                  </span>
                )}
                {selectedServices.length > 0 && (
                  <span className="px-2 py-1 rounded text-xs bg-muted text-foreground/70 border border-border">
                    {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""}
                  </span>
                )}
                {sortBy !== "rating" && (
                  <span className="px-2 py-1 rounded text-xs bg-muted text-foreground/70 border border-border">
                    {sortOptions.find(o => o.value === sortBy)?.label}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-foreground/60 hover:text-foreground transition-colors cursor-pointer underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Filter Modal */}
          <FilterModal
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            niches={niches}
            locations={locations}
            availableServices={availableServices}
            sortOptions={sortOptions}
            selectedNiche={selectedNiche}
            selectedLocation={selectedLocation}
            selectedServices={selectedServices}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sortBy={sortBy}
            onNicheChange={handleNicheChange}
            onLocationChange={handleLocationChange}
            onServiceToggle={toggleService}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onSortChange={handleSortChange}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 rounded-lg border border-border bg-card text-sm text-foreground/70">
              {error}
            </div>
          )}

          {/* Results Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-foreground/60">
              {agencies.length} {agencies.length === 1 
                ? (selectedProfileType === "kol" ? "KOL" : selectedProfileType === "agency" ? "agency" : "profile")
                : (selectedProfileType === "kol" ? "KOLs" : selectedProfileType === "agency" ? "agencies" : "profiles")} found
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </div>
            {loading && agencies.length > 0 && (
              <LoadingSpinner className="w-4 h-4" />
            )}
          </div>

          {/* Agency Grid */}
          {paginatedItems.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedItems.map((agency, index) => (
                <motion.div
                  key={agency.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="group relative"
                >
                  {/* Stacked layers effect */}
                  <div className="absolute inset-0 bg-foreground/5 rounded-xl blur-xl group-hover:bg-foreground/10 transition-all -z-10" style={{ transform: `translate(${index % 3 * 2}px, ${index % 3 * 2}px)` }}></div>
                  
                  <div className="relative p-6 rounded-xl border-2 border-border bg-card hover:border-foreground/40 hover:shadow-md transition-all h-full flex flex-col">
                    {/* Profile Type Badge */}
                    {(agency as any).profile_type === "kol" && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-foreground/10 border border-foreground/20">
                          <span className="text-xs font-medium text-foreground/60">KOL</span>
                        </div>
                      </div>
                    )}
                    {/* Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <h3 
                            className="text-lg font-medium"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(agency.name, searchQuery),
                            }}
                          />
                          {agency.verified && (
                            <CheckCircle2 className="h-4 w-4 text-foreground/40 flex-shrink-0" />
                          )}
                        </div>
                        <FavoriteButton agencyId={agency.id} />
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-foreground/20 text-foreground/40" />
                          <span className="font-medium">{agency.rating}</span>
                          <span className="text-foreground/50">
                            ({agency.reviews})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Niche Badge */}
                    <div className="mb-4">
                      <span 
                        className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-foreground/70 border border-border"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(agency.niche, searchQuery),
                        }}
                      />
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-foreground/60 mb-4">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span
                        dangerouslySetInnerHTML={{
                          __html: highlightText(agency.location, searchQuery),
                        }}
                      />
                    </div>

                    {/* Services */}
                    <div className="mb-4 flex-1">
                      <p className="text-xs font-medium text-foreground/50 mb-2">Services</p>
                      <div className="flex flex-wrap gap-2">
                        {agency.services.slice(0, 3).map((service) => (
                          <span
                            key={service}
                            className="px-2 py-1 rounded text-xs bg-muted text-foreground/60 border border-border"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(service, searchQuery),
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="mb-6 pt-4 border-t border-border">
                      <p className="text-xs font-medium text-foreground/50 mb-1">Starting from</p>
                      <p className="text-base font-medium">{agency.priceRange}</p>
                    </div>

                    {/* CTA */}
                    <Link 
                      href={`/agencies/${agency.id}`} 
                      className="cursor-pointer"
                      onClick={() => {
                        analytics.track("Agency Profile Viewed", {
                          agencyId: agency.id,
                          agencyName: agency.name,
                        });
                      }}
                    >
                      <Button
                        variant="outline"
                        className="w-full group-hover:bg-foreground group-hover:text-background transition-colors cursor-pointer"
                      >
                        View Profile
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
                ))}
              </div>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                />
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Search className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No agencies found</h3>
              <p className="text-sm text-foreground/60 mb-6">
                {hasActiveFilters
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "No agencies available at the moment."}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} className="cursor-pointer">
                  Clear Filters
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

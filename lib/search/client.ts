// Search client for MeiliSearch
import { MeiliSearch } from "meilisearch";

export interface SearchOptions {
  query?: string;
  niche?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  services?: string[];
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  hits: any[];
  total: number;
  page: number;
  totalPages: number;
}

class SearchClient {
  private client: MeiliSearch | null = null;
  private indexName = "agencies";

  constructor() {
    const host = process.env.NEXT_PUBLIC_MEILISEARCH_HOST;
    const searchKey = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY;

    if (host && searchKey && host !== "http://localhost:7700" && searchKey !== "your_meilisearch_search_key") {
      try {
        this.client = new MeiliSearch({
          host,
          apiKey: searchKey,
        });
      } catch (error) {
        console.warn("MeiliSearch client initialization failed:", error);
      }
    }
  }

  async search(options: SearchOptions): Promise<SearchResult> {
    if (!this.client) {
      // Return empty result if MeiliSearch is not configured
      return {
        hits: [],
        total: 0,
        page: 0,
        totalPages: 0,
      };
    }

    try {
      const index = this.client.index(this.indexName);

      let searchParams: any = {
        limit: options.limit || 20,
        offset: options.offset || 0,
      };

      // Build filter array
      const filters: string[] = [];

      if (options.niche && options.niche !== "All") {
        filters.push(`niche = "${options.niche}"`);
      }

      if (options.location) {
        filters.push(`location = "${options.location}"`);
      }

      if (options.minPrice !== undefined || options.maxPrice !== undefined) {
        // Assuming priceRangeMin and priceRangeMax are numeric fields in MeiliSearch
        if (options.minPrice !== undefined && options.maxPrice !== undefined) {
          filters.push(`priceRangeMin >= ${options.minPrice} AND priceRangeMax <= ${options.maxPrice}`);
        } else if (options.minPrice !== undefined) {
          filters.push(`priceRangeMin >= ${options.minPrice}`);
        } else if (options.maxPrice !== undefined) {
          filters.push(`priceRangeMax <= ${options.maxPrice}`);
        }
      }

      if (filters.length > 0) {
        searchParams.filter = filters.join(" AND ");
      }

      // Execute search
      const results = await index.search(options.query || "", searchParams);

      return {
        hits: results.hits || [],
        total: results.estimatedTotalHits || 0,
        page: Math.floor((options.offset || 0) / (options.limit || 20)) + 1,
        totalPages: Math.ceil((results.estimatedTotalHits || 0) / (options.limit || 20)),
      };
    } catch (error) {
      console.error("Search error:", error);
      return {
        hits: [],
        total: 0,
        page: 0,
        totalPages: 0,
      };
    }
  }

  async getFilters(): Promise<{
    niches: string[];
    locations: string[];
    services: string[];
  }> {
    // MeiliSearch is optional - return empty arrays if not configured
    // Filters are handled client-side via Supabase queries
    return {
      niches: [],
      locations: [],
      services: [],
    };
  }
}

export const searchClient = new SearchClient();

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Singleton pattern to prevent multiple client instances
let supabaseClient: SupabaseClient | null = null;

export function createSupabaseClient() {
  // Return existing client if available
  if (supabaseClient) {
    return supabaseClient;
  }

  // Create new client with rate limiting protection
  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'sb-auth-token',
      },
      // Remove custom fetch wrapper - it's causing conflicts with browser extensions
      // The rate limiting is already handled by refresh throttling
    }
  );
  
  // Manually handle token refresh only when needed (not on interval)
  if (typeof window !== 'undefined') {
    // Override the auto-refresh behavior
    const originalRefresh = supabaseClient.auth.refreshSession;
    let lastRefreshTime = 0;
    const MIN_REFRESH_INTERVAL = 60000; // 1 minute minimum between refreshes
    
    supabaseClient.auth.refreshSession = async function(...args) {
      const now = Date.now();
      if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
        // Too soon, return current session
        const { data: { session } } = await supabaseClient.auth.getSession();
        return { data: { session }, error: null };
      }
      lastRefreshTime = now;
      return originalRefresh.apply(this, args);
    };
  }

  return supabaseClient;
}

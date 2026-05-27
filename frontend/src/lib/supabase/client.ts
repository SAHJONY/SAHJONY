import { createBrowserClient } from "@supabase/ssr";

// Singleton client instance
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // On server during build/render
  if (typeof window === 'undefined') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Only create real client if we have valid config
    if (supabaseUrl && supabaseAnonKey && 
        !supabaseUrl.includes('placeholder') && 
        supabaseUrl.startsWith('http')) {
      if (!supabaseClient) {
        supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
      }
      return supabaseClient;
    }
    
    // Return null when not configured on server - this prevents SSR serialization issues
    return null;
  }
  
  // On client, create browser client (fresh each time for browser context)
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey && 
        !supabaseUrl.includes('placeholder') && 
        supabaseUrl.startsWith('http')) {
      supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    } else {
      // Return null on client too if not configured
      return null;
    }
  }
  
  return supabaseClient;
}

// For server components - always create new instance to avoid caching issues
export function createServerClient() {
  if (typeof window === 'undefined') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey && 
        !supabaseUrl.includes('placeholder') && 
        supabaseUrl.startsWith('http')) {
      return createBrowserClient(supabaseUrl, supabaseAnonKey);
    }
    return null;
  }
  
  return null; // Don't use server client in browser
}
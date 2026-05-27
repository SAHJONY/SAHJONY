import { createBrowserClient } from "@supabase/ssr";

// Singleton client instance - lazily initialized
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // On server during build/render
  if (typeof window === 'undefined') {
    try {
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
    } catch (e) {
      console.error('Error creating Supabase client on server:', e);
    }
    
    // Return null when not configured on server
    return null;
  }
  
  // On client
  try {
    if (!supabaseClient) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseAnonKey && 
          !supabaseUrl.includes('placeholder') && 
          supabaseUrl.startsWith('http')) {
        supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
      } else {
        return null;
      }
    }
  } catch (e) {
    console.error('Error creating Supabase client on client:', e);
    return null;
  }
  
  return supabaseClient;
}

// For server components
export function createServerClient() {
  if (typeof window === 'undefined') {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseAnonKey && 
          !supabaseUrl.includes('placeholder') && 
          supabaseUrl.startsWith('http')) {
        return createBrowserClient(supabaseUrl, supabaseAnonKey);
      }
    } catch (e) {
      console.error('Error creating server client:', e);
    }
    return null;
  }
  
  return null;
}
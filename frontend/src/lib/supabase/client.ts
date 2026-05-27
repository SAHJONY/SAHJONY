import { createBrowserClient } from "@supabase/ssr";

let supabaseClient: any = null;

export function createClient() {
  // Check for placeholder values used during build
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // If we already have a client, return it
  if (supabaseClient) {
    return supabaseClient;
  }
  
  // Check for placeholder values
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');
  
  if (isPlaceholder) {
    // Return a simple mock object that won't cause serialization issues
    // Use a class-like pattern with methods that are defined at runtime
    const mockAuth = {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: (callback: Function) => ({ 
        data: { subscription: { unsubscribe: () => {} } } 
      }),
      signInWithPassword: async () => ({ data: { session: null, user: null }, error: { message: 'Not configured' } }),
      signUp: async () => ({ data: { session: null, user: null }, error: { message: 'Not configured' } }),
      signOut: async () => ({ error: null }),
    };
    
    const mockFrom = () => ({
      select: () => ({ data: [], error: null }),
      eq: () => ({ single: async () => ({ data: null, error: null }) }),
      insert: async () => ({ data: null, error: { message: 'Not configured' } }),
      update: async () => ({ data: null, error: { message: 'Not configured' } }),
      delete: async () => ({ data: null, error: { message: 'Not configured' } }),
    });
    
    // Create a proxy that returns the mock objects
    supabaseClient = new Proxy({}, {
      get(target, prop) {
        if (prop === 'auth') return mockAuth;
        if (prop === 'from') return mockFrom;
        return undefined;
      }
    });
    
    return supabaseClient;
  }

  supabaseClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  return supabaseClient;
}
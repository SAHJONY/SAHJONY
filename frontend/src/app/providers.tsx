"use client";

import { SessionContextProvider } from "@/components/providers";
import { createClient } from "@/lib/supabase/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  return (
    <SessionContextProvider supabase={supabase}>
      {children}
    </SessionContextProvider>
  );
}
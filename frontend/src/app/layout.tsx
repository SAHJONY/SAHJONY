import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/client";
import { SessionContextProvider } from "@/components/providers";

export const metadata: Metadata = {
  title: "Hermes Agent SaaS",
  description: "Multi-user AI Agent Platform powered by hermes-agent",
};

// Force dynamic rendering to avoid SSR pre-rendering issues with Supabase
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-white antialiased">
        <SessionContextProvider supabase={supabase}>
          {children}
        </SessionContextProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";
import { createServerClient } from "@/lib/supabase/server";
import { SessionContextProvider } from "@/components/providers";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Hermes Agent SaaS",
  description: "Multi-user AI Agent Platform powered by hermes-agent",
};

// Force dynamic rendering to avoid SSR pre-rendering issues with Supabase
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();

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
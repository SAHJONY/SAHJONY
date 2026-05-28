import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SAHJONY - AI Agent Platform",
  description: "Multi-user AI Agent Platform powered by SAHJONY",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
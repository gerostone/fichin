import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";

import { MobileNav } from "@/components/layout/mobile-nav";
import { TopNav } from "@/components/layout/top-nav";
import { PwaRegister } from "@/components/providers/pwa-register";
import { AuthSessionProvider } from "@/components/providers/session-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Fichin",
  description: "Busca, guarda y reseña videojuegos con puntajes del 1 al 100.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fichin",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <AuthSessionProvider>
          <PwaRegister />
          <TopNav />
          <main className="mx-auto min-h-[calc(100vh-64px)] w-full max-w-6xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
            {children}
          </main>
          <MobileNav />
        </AuthSessionProvider>
        <Analytics />
      </body>
    </html>
  );
}

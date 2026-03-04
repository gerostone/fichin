import type { Metadata } from "next";

import { MobileNav } from "@/components/layout/mobile-nav";
import { TopNav } from "@/components/layout/top-nav";
import { AuthSessionProvider } from "@/components/providers/session-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Fichin",
  description: "Busca, guarda y reseña videojuegos con puntajes del 1 al 100.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <AuthSessionProvider>
          <TopNav />
          <main className="mx-auto min-h-[calc(100vh-64px)] w-full max-w-6xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
            {children}
          </main>
          <MobileNav />
        </AuthSessionProvider>
      </body>
    </html>
  );
}

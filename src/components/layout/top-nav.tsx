"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/me/library", label: "Biblioteca" },
  { href: "/me/reviews", label: "Mis reseñas" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="text-lg font-bold tracking-wide text-cyan-200">
          Fichin
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm transition ${
                isActive(pathname, link.href)
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-900/70 text-slate-200 hover:bg-slate-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="hidden text-sm text-slate-300 sm:inline">@{session.user.username}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-orange-300/70 px-3 py-2 text-xs font-semibold text-orange-200 hover:bg-orange-400/10"
              >
                Salir
              </button>
            </>
          ) : status === "loading" ? (
            <span className="text-xs text-slate-400">Cargando...</span>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-full border border-cyan-300/60 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

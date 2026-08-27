"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/me/library", label: "Biblioteca" },
  { href: "/members", label: "Miembros" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const mobileLinks = session?.user ? [...links, { href: "/me", label: "Mi perfil" }] : links;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/95 p-2 backdrop-blur md:hidden">
      <ul className={`grid gap-2 ${mobileLinks.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
        {mobileLinks.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex min-h-11 items-center justify-center rounded-xl text-xs font-semibold ${
                  active ? "bg-cyan-500 text-slate-950" : "bg-slate-900 text-slate-300"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

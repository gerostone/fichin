"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Explorar" },
  { href: "/feed", label: "Feed" },
  { href: "/me/library", label: "Biblioteca" },
  { href: "/me", label: "Perfil" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/95 p-2 backdrop-blur md:hidden">
      <ul className="grid grid-cols-4 gap-2">
        {links.map((link) => {
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

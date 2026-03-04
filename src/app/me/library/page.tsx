import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type LibraryPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/me/library");
  }

  const params = await searchParams;
  const status = params.status === "PLAYED" ? "PLAYED" : "WISHLIST";

  const entries = await prisma.userGame.findMany({
    where: {
      userId: session.user.id,
      status,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      game: true,
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Mi biblioteca</h1>
        <div className="mt-3 flex gap-2">
          <Link
            href="/me/library?status=WISHLIST"
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              status === "WISHLIST" ? "bg-cyan-500 text-slate-950" : "bg-slate-900 text-slate-300"
            }`}
          >
            Wishlist
          </Link>
          <Link
            href="/me/library?status=PLAYED"
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              status === "PLAYED" ? "bg-orange-400 text-slate-950" : "bg-slate-900 text-slate-300"
            }`}
          >
            Jugados
          </Link>
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-slate-300">
          No tenés juegos en esta sección.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/games/${entry.game.slug}`}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 hover:border-cyan-300/50"
            >
              <p className="font-semibold text-slate-100">{entry.game.title}</p>
              <p className="mt-1 text-xs text-slate-400">Estado: {entry.status === "PLAYED" ? "Jugado" : "Wishlist"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

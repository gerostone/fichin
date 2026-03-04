import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

function formatCount(value: number, unit: string): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k ${unit}`;
  }

  return `${value} ${unit}`;
}

function buildAvatarSeed(username: string): string {
  const colors = ["#0ea5e9", "#22d3ee", "#fb923c", "#38bdf8", "#14b8a6"];
  let hash = 0;

  for (let i = 0; i < username.length; i += 1) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export default async function MembersPage() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          reviews: true,
          followers: true,
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          game: {
            select: {
              slug: true,
              title: true,
              coverUrl: true,
            },
          },
        },
      },
    },
    take: 120,
  });

  const featuredMembers = [...users]
    .sort((a, b) => {
      const scoreA = a._count.followers * 3 + a._count.reviews;
      const scoreB = b._count.followers * 3 + b._count.reviews;
      return scoreB - scoreA;
    })
    .slice(0, 6);

  const popularMembers = [...users]
    .sort((a, b) => b._count.reviews - a._count.reviews)
    .slice(0, 18);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 md:p-10">
        <h1 className="text-center text-3xl font-bold text-slate-100 md:text-5xl">
          Jugadores, críticos y comunidad.
          <br className="hidden md:block" />
          Encontrá miembros destacados en Fichin.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-slate-300 md:text-base">
          Seguí perfiles, descubrí nuevas reseñas y armá tu red social gamer.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-white/15 pb-3">
          <h2 className="text-sm font-semibold tracking-[0.15em] text-slate-300">MIEMBROS DESTACADOS</h2>
        </div>

        {featuredMembers.length === 0 ? (
          <p className="text-sm text-slate-400">Aún no hay miembros para mostrar.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {featuredMembers.map((member) => {
              const avatarColor = buildAvatarSeed(member.username);
              const initials = member.username.slice(0, 2).toUpperCase();

              return (
                <article key={member.id} className="space-y-3">
                  <Link href={`/users/${member.username}`} className="group block">
                    <div
                      className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full border border-white/20 text-4xl font-bold text-slate-950 transition group-hover:scale-[1.03]"
                      style={{ background: `radial-gradient(circle at 20% 20%, #ffffff, ${avatarColor})` }}
                    >
                      {initials}
                    </div>
                  </Link>

                  <div className="text-center">
                    <Link href={`/users/${member.username}`} className="text-xl font-semibold text-slate-100 hover:text-cyan-200">
                      {member.username}
                    </Link>
                    <p className="mt-1 text-sm text-slate-300">
                      {formatCount(member._count.reviews, "reseñas")} · {formatCount(member._count.followers, "seguidores")}
                    </p>
                  </div>

                  <div className="grid grid-cols-6 gap-1">
                    {member.reviews.slice(0, 6).map((review) => (
                      <Link key={review.id} href={`/games/${review.game.slug}`} title={review.game.title} className="block">
                        {review.game.coverUrl ? (
                          <Image
                            src={review.game.coverUrl}
                            alt={review.game.title}
                            width={120}
                            height={180}
                            className="h-16 w-full rounded-md border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="h-16 w-full rounded-md border border-white/10 bg-slate-800" />
                        )}
                      </Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-white/15 pb-3">
          <h2 className="text-sm font-semibold tracking-[0.15em] text-slate-300">POPULARES ESTA SEMANA</h2>
        </div>

        {popularMembers.length === 0 ? (
          <p className="text-sm text-slate-400">Aún no hay miembros para mostrar.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularMembers.map((member) => {
              const avatarColor = buildAvatarSeed(member.username);
              const initials = member.username.slice(0, 2).toUpperCase();

              return (
                <Link
                  key={member.id}
                  href={`/users/${member.username}`}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3 hover:border-cyan-300/50"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-slate-950"
                    style={{ background: `radial-gradient(circle at 20% 20%, #ffffff, ${avatarColor})` }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{member.username}</p>
                    <p className="text-xs text-slate-300">
                      {formatCount(member._count.reviews, "reseñas")} · {formatCount(member._count.followers, "seguidores")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";

type LibraryGameCardProps = {
  game: {
    title: string;
    slug: string;
    coverUrl: string | null;
  };
  averageScore: number | null;
  reviewCount: number;
};

export function LibraryGameCard({ game, averageScore, reviewCount }: LibraryGameCardProps) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block overflow-hidden rounded-xl border border-white/10 bg-slate-900/60 transition hover:border-cyan-300/50"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-800">
        {game.coverUrl ? (
          <Image
            src={game.coverUrl}
            alt={game.title}
            fill
            sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 220px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center text-sm text-slate-400">Sin portada</div>
        )}
      </div>

      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-lg font-semibold text-slate-100">{game.title}</p>
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>Comunidad: {averageScore ? Math.round(averageScore) : "N/A"}</span>
          <span>
            {reviewCount} reseña{reviewCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </Link>
  );
}

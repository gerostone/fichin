import Image from "next/image";
import Link from "next/link";

type GameCardProps = {
  game: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    genres: string[];
    platforms: string[];
    ratingGlobal: number | null;
    averageScore?: number | null;
    reviewCount?: number;
  };
};

export function GameCard({ game }: GameCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
      <div className="h-44 w-full overflow-hidden bg-slate-800">
        {game.coverUrl ? (
          <Image
            src={game.coverUrl}
            alt={game.title}
            width={640}
            height={360}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">Sin portada</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-slate-100">{game.title}</h3>

        <div className="flex flex-wrap gap-2 text-xs">
          {game.genres.slice(0, 3).map((genre) => (
            <span key={genre} className="rounded-full bg-cyan-500/20 px-2 py-1 text-cyan-100">
              {genre}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between text-sm text-slate-300">
          <span>Global: {game.ratingGlobal ?? "N/A"}</span>
          <span>Comunidad: {game.averageScore ? Math.round(game.averageScore) : "N/A"}</span>
        </div>

        <Link
          href={`/games/${game.slug}`}
          className="mt-2 inline-flex min-h-11 items-center justify-center rounded-xl bg-orange-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-orange-300"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}

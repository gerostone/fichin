import Image from "next/image";
import Link from "next/link";

type PlatformIcon = {
  key: string;
  label: string;
  glyph: string;
};

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

function mapPlatformToIcon(platform: string): PlatformIcon | null {
  const normalized = platform.toLowerCase();

  if (normalized.includes("playstation")) {
    return { key: "playstation", label: platform, glyph: "PS" };
  }

  if (normalized.includes("xbox")) {
    return { key: "xbox", label: platform, glyph: "XB" };
  }

  if (normalized.includes("nintendo switch")) {
    return { key: "switch", label: platform, glyph: "SW" };
  }

  if (normalized.includes("nintendo")) {
    return { key: "nintendo", label: platform, glyph: "N" };
  }

  if (
    normalized.includes("windows") ||
    normalized.includes("pc") ||
    normalized.includes("linux") ||
    normalized.includes("mac")
  ) {
    return { key: "pc", label: platform, glyph: "PC" };
  }

  if (normalized.includes("android") || normalized.includes("ios") || normalized.includes("mobile")) {
    return { key: "mobile", label: platform, glyph: "M" };
  }

  if (normalized.includes("sega")) {
    return { key: "sega", label: platform, glyph: "SG" };
  }

  if (normalized.includes("atari")) {
    return { key: "atari", label: platform, glyph: "AT" };
  }

  return null;
}

export function GameCard({ game }: GameCardProps) {
  const platformIcons = game.platforms
    .map(mapPlatformToIcon)
    .filter((icon): icon is PlatformIcon => icon !== null)
    .reduce<PlatformIcon[]>((acc, current) => {
      if (acc.some((item) => item.key === current.key)) {
        return acc;
      }
      return [...acc, current];
    }, [])
    .slice(0, 5);

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
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-100">{game.title}</h3>
          {platformIcons.length > 0 ? (
            <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
              {platformIcons.map((icon) => (
                <span
                  key={icon.key}
                  title={icon.label}
                  className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-white/25 bg-slate-950/90 px-1 text-[10px] font-semibold text-cyan-100"
                  aria-label={icon.label}
                >
                  {icon.glyph}
                </span>
              ))}
            </div>
          ) : null}
        </div>

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

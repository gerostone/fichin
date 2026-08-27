import Image from "next/image";
import Link from "next/link";

type PlatformIcon = {
  key: string;
  label: string;
  glyph: string;
};

type GamePosterCardProps = {
  game: {
    slug: string;
    title: string;
    coverUrl: string | null;
    platforms: string[];
  };
  communityScore: number | null;
  reviewCount: number;
  className?: string;
};

function mapPlatformToIcon(platform: string): PlatformIcon | null {
  const normalized = platform.toLowerCase();

  if (normalized.includes("playstation")) return { key: "playstation", label: platform, glyph: "PS" };
  if (normalized.includes("xbox")) return { key: "xbox", label: platform, glyph: "XB" };
  if (normalized.includes("nintendo switch")) return { key: "switch", label: platform, glyph: "SW" };
  if (normalized.includes("nintendo")) return { key: "nintendo", label: platform, glyph: "N" };

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

  if (normalized.includes("sega")) return { key: "sega", label: platform, glyph: "SG" };
  if (normalized.includes("atari")) return { key: "atari", label: platform, glyph: "AT" };

  return null;
}

export function GamePosterCard({ game, communityScore, reviewCount, className }: GamePosterCardProps) {
  const platformIcons = game.platforms
    .map(mapPlatformToIcon)
    .filter((icon): icon is PlatformIcon => icon !== null)
    .reduce<PlatformIcon[]>((acc, current) => {
      if (acc.some((item) => item.key === current.key)) {
        return acc;
      }
      return [...acc, current];
    }, [])
    .slice(0, 4);

  return (
    <article className={`group overflow-hidden rounded-xl border border-white/12 bg-slate-900/60 ${className ?? ""}`}>
      <Link href={`/games/${game.slug}`} className="block">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
          {game.coverUrl ? (
            <Image
              src={game.coverUrl}
              alt={game.title}
              fill
              sizes="(max-width: 768px) 40vw, 220px"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-sm text-slate-400">Sin portada</div>
          )}
        </div>
      </Link>

      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-semibold text-slate-100">{game.title}</p>
          {platformIcons.length > 0 ? (
            <div className="flex shrink-0 flex-wrap justify-end gap-1">
              {platformIcons.map((icon) => (
                <span
                  key={icon.key}
                  title={icon.label}
                  aria-label={icon.label}
                  className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-white/25 bg-slate-950/90 px-1 text-[10px] font-semibold text-cyan-100"
                >
                  {icon.glyph}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Comunidad: {communityScore ? Math.round(communityScore) : "N/A"}</span>
          <span>{reviewCount} reseñas</span>
        </div>
      </div>
    </article>
  );
}

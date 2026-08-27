"use client";

import { useRef } from "react";

import { GamePosterCard } from "@/components/games/game-poster-card";

type CarouselGame = {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  platforms: string[];
  communityScore: number | null;
  reviewCount: number;
};

type GameCarouselProps = {
  title: string;
  games: CarouselGame[];
  emptyText: string;
};

function scrollByCardWidth(container: HTMLDivElement | null, direction: 1 | -1) {
  if (!container) {
    return;
  }

  const card = container.querySelector<HTMLElement>("[data-carousel-card='true']");
  const cardWidth = card?.offsetWidth ?? 220;
  const gap = 16;

  container.scrollBy({
    left: direction * (cardWidth + gap) * 2,
    behavior: "smooth",
  });
}

export function GameCarousel({ title, games, emptyText }: GameCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between border-b border-white/20 pb-2">
        <h2 className="text-base font-semibold tracking-[0.08em] text-slate-200 uppercase md:text-lg">{title}</h2>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollByCardWidth(scrollRef.current, -1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-slate-950/80 text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-100"
            aria-label={`Desplazar ${title} hacia la izquierda`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCardWidth(scrollRef.current, 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-slate-950/80 text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-100"
            aria-label={`Desplazar ${title} hacia la derecha`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-sm text-slate-300">{emptyText}</div>
      ) : (
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {games.map((game) => (
            <div key={game.id} data-carousel-card="true" className="w-[180px] shrink-0 snap-start md:w-[220px]">
              <GamePosterCard
                game={{
                  slug: game.slug,
                  title: game.title,
                  coverUrl: game.coverUrl,
                  platforms: game.platforms,
                }}
                communityScore={game.communityScore}
                reviewCount={game.reviewCount}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export const NON_CANONICAL_TITLE_MARKERS = [
  "season",
  "edition",
  "bundle",
  "pack",
  "dlc",
  "expansion",
  "remaster",
  "remastered",
  "definitive",
  "collector",
  "collectors",
  "goty",
  "gold",
  "ultimate",
  "deluxe",
  "prestige",
  "soundtrack",
  "skin",
  "beta",
  "alpha",
];

export function buildCanonicalGameFilter() {
  return {
    NOT: NON_CANONICAL_TITLE_MARKERS.map((marker) => ({
      title: {
        contains: marker,
        mode: "insensitive" as const,
      },
    })),
  };
}

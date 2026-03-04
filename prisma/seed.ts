import { PrismaClient } from "@prisma/client";
import fallbackGames from "./data/famous-games.json";

const prisma = new PrismaClient();

type IgdbGame = {
  id: number;
  name: string;
  slug: string | null;
  summary: string | null;
  rating: number | null;
  first_release_date: number | null;
  genres: Array<{ name: string }> | null;
  platforms: Array<{ name: string }> | null;
  cover: { url: string } | null;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeIgdbCoverUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  const withProtocol = url.startsWith("//") ? `https:${url}` : url;
  return withProtocol.replace("t_thumb", "t_cover_big");
}

async function upsertGames(
  games: Array<{
    externalId: string;
    title: string;
    slug: string;
    coverUrl?: string | null;
    releaseDate?: string | null;
    genres: string[];
    platforms: string[];
    summary?: string | null;
    ratingGlobal?: number | null;
  }>
) {
  for (const game of games) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: {
        title: game.title,
        externalId: game.externalId,
        coverUrl: game.coverUrl ?? null,
        releaseDate: game.releaseDate ? new Date(game.releaseDate) : null,
        genres: game.genres,
        platforms: game.platforms,
        summary: game.summary ?? null,
        ratingGlobal: game.ratingGlobal ?? null,
      },
      create: {
        title: game.title,
        externalId: game.externalId,
        slug: game.slug,
        coverUrl: game.coverUrl ?? null,
        releaseDate: game.releaseDate ? new Date(game.releaseDate) : null,
        genres: game.genres,
        platforms: game.platforms,
        summary: game.summary ?? null,
        ratingGlobal: game.ratingGlobal ?? null,
      },
    });
  }
}

async function fetchTwitchAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const url = new URL("https://id.twitch.tv/oauth2/token");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("client_secret", clientSecret);
  url.searchParams.set("grant_type", "client_credentials");

  const response = await fetch(url.toString(), { method: "POST" });
  if (!response.ok) {
    throw new Error(`Twitch token request failed (${response.status})`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Twitch token response missing access_token");
  }

  return data.access_token;
}

async function fetchIgdbGames(): Promise<IgdbGame[]> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return [];
  }

  const accessToken = await fetchTwitchAccessToken(clientId, clientSecret);
  const offsets = [0, 100, 200];
  const results: IgdbGame[] = [];

  for (const offset of offsets) {
    const query = [
      "fields id,name,slug,summary,rating,first_release_date,genres.name,platforms.name,cover.url;",
      "where rating != null;",
      "sort rating desc;",
      "limit 100;",
      `offset ${offset};`,
    ].join(" ");

    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      body: query,
    });

    if (!response.ok) {
      throw new Error(`IGDB request failed at offset ${offset} (${response.status})`);
    }

    const data = (await response.json()) as IgdbGame[];
    results.push(...data);

    // IGDB rate limit: max 4 requests/second.
    await sleep(300);
  }

  return results;
}

async function main() {
  const igdbGames = await fetchIgdbGames().catch((error) => {
    console.warn(`IGDB seed failed, using fallback dataset. Reason: ${String(error)}`);
    return [];
  });

  if (igdbGames.length > 0) {
    await upsertGames(
      igdbGames
        .filter((game) => game.name)
        .map((game) => ({
          externalId: `igdb-${game.id}`,
          title: game.name,
          slug: game.slug || slugify(game.name),
          coverUrl: normalizeIgdbCoverUrl(game.cover?.url),
          releaseDate: game.first_release_date
            ? new Date(game.first_release_date * 1000).toISOString().slice(0, 10)
            : null,
          genres: game.genres?.map((genre) => genre.name) ?? [],
          platforms: game.platforms?.map((platform) => platform.name) ?? [],
          summary: game.summary,
          ratingGlobal: game.rating ? Math.round(game.rating) : null,
        }))
    );

    console.log(`Seeded ${igdbGames.length} games from IGDB.`);
    return;
  }

  await upsertGames(
    fallbackGames.map((game) => ({
      ...game,
      slug: game.slug || slugify(game.title),
    }))
  );
  console.log(`Seeded ${fallbackGames.length} fallback games.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

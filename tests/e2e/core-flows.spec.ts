import { APIRequestContext, expect, test } from "@playwright/test";

type GamesResponse = {
  games: Array<{ id: string; slug: string; title: string }>;
};

async function registerUser(request: APIRequestContext, email: string, username: string, password: string) {
  const response = await request.post("/api/auth/register", {
    data: { email, username, password },
  });

  expect(response.status()).toBe(201);
  const body = (await response.json()) as { user: { email: string; username: string } };
  expect(body.user.email).toBe(email);
  expect(body.user.username).toBe(username);
}

async function loginWithCredentials(request: APIRequestContext, baseURL: string, email: string, password: string) {
  const csrfResponse = await request.get("/api/auth/csrf");
  expect(csrfResponse.ok()).toBeTruthy();
  const csrfBody = (await csrfResponse.json()) as { csrfToken: string };

  const loginResponse = await request.post("/api/auth/callback/credentials", {
    form: {
      csrfToken: csrfBody.csrfToken,
      email,
      password,
      callbackUrl: `${baseURL}/dashboard`,
      json: "true",
    },
  });

  expect(loginResponse.ok()).toBeTruthy();

  const sessionResponse = await request.get("/api/auth/session");
  expect(sessionResponse.ok()).toBeTruthy();
  const sessionBody = (await sessionResponse.json()) as { user?: { email?: string } };
  expect(sessionBody.user?.email).toBe(email);
}

test("E2E authenticated flow: register -> login -> save -> review -> delete", async ({ request, baseURL }) => {
  const gamesResponse = await request.get("/api/games?limit=1");
  expect(gamesResponse.ok()).toBeTruthy();
  const gamesBody = (await gamesResponse.json()) as GamesResponse;
  expect(gamesBody.games.length).toBeGreaterThan(0);

  const game = gamesBody.games[0];
  const timestamp = Date.now();
  const email = `e2e_${timestamp}@fichin.test`;
  const username = `e2euser_${timestamp}`;
  const password = "StrongPass1";

  await registerUser(request, email, username, password);
  await loginWithCredentials(request, baseURL ?? "http://localhost:3000", email, password);

  const saveWishlist = await request.post("/api/user-games", {
    data: { gameId: game.id, status: "WISHLIST" },
  });
  expect(saveWishlist.status()).toBe(200);
  const saveWishlistBody = (await saveWishlist.json()) as { userGame: { id: string; status: string } };
  expect(saveWishlistBody.userGame.status).toBe("WISHLIST");

  const savePlayed = await request.post("/api/user-games", {
    data: { gameId: game.id, status: "PLAYED" },
  });
  expect(savePlayed.status()).toBe(200);
  const savePlayedBody = (await savePlayed.json()) as { userGame: { id: string; status: string } };
  expect(savePlayedBody.userGame.status).toBe("PLAYED");
  expect(savePlayedBody.userGame.id).toBe(saveWishlistBody.userGame.id);

  const invalidReview = await request.post("/api/reviews", {
    data: { gameId: game.id, score: 101, content: "Puntaje inválido" },
  });
  expect(invalidReview.status()).toBe(400);

  const validReview = await request.post("/api/reviews", {
    data: { gameId: game.id, score: 91, content: "Excelente gameplay y worldbuilding" },
  });
  expect(validReview.status()).toBe(200);
  const validReviewBody = (await validReview.json()) as { review: { id: string } };

  const detailResponse = await request.get(`/api/games/${game.id}`);
  expect(detailResponse.ok()).toBeTruthy();
  const detailBody = (await detailResponse.json()) as { averageScore: number | null; reviewCount: number };
  expect(detailBody.averageScore).toBeGreaterThanOrEqual(1);
  expect(detailBody.averageScore).toBeLessThanOrEqual(100);
  expect(detailBody.reviewCount).toBeGreaterThanOrEqual(1);

  const libraryResponse = await request.get("/me/library?status=PLAYED");
  expect(libraryResponse.status()).toBe(200);
  const libraryHtml = await libraryResponse.text();
  expect(libraryHtml).toContain(game.title);

  const deleteResponse = await request.delete(`/api/reviews/${validReviewBody.review.id}`);
  expect(deleteResponse.status()).toBe(200);
});

test("E2E auth guard: protected APIs return 401 without session", async ({ request }) => {
  const saveResponse = await request.post("/api/user-games", {
    data: { gameId: "11111111-1111-1111-1111-111111111111", status: "WISHLIST" },
  });
  expect(saveResponse.status()).toBe(401);
  await expect(saveResponse.json()).resolves.toMatchObject({ error: "Unauthorized" });

  const deleteResponse = await request.delete("/api/reviews/11111111-1111-1111-1111-111111111111");
  expect(deleteResponse.status()).toBe(401);
  await expect(deleteResponse.json()).resolves.toMatchObject({ error: "Unauthorized" });

  const followResponse = await request.post("/api/follows", {
    data: { username: "someone" },
  });
  expect(followResponse.status()).toBe(401);
  await expect(followResponse.json()).resolves.toMatchObject({ error: "Unauthorized" });

  const avatarResponse = await request.patch("/api/me/avatar", {
    data: { avatarUrl: "https://example.com/avatar.png" },
  });
  expect(avatarResponse.status()).toBe(401);
  await expect(avatarResponse.json()).resolves.toMatchObject({ error: "Unauthorized" });
});

test("E2E catalog search: keyword and genre filters return results", async ({ request }) => {
  const keywordResponse = await request.get("/api/games?limit=20&q=arches");
  expect(keywordResponse.ok()).toBeTruthy();
  const keywordBody = (await keywordResponse.json()) as {
    games: Array<{ title: string }>;
    pagination: { total: number };
  };

  expect(keywordBody.pagination.total).toBeGreaterThan(0);
  expect(keywordBody.games.some((game) => game.title.toLowerCase().includes("arches"))).toBeTruthy();

  const genreResponse = await request.get("/api/games?limit=20&genre=Indie");
  expect(genreResponse.ok()).toBeTruthy();
  const genreBody = (await genreResponse.json()) as {
    games: Array<{ genres: string[] }>;
    pagination: { total: number };
  };

  expect(genreBody.pagination.total).toBeGreaterThan(0);
  expect(genreBody.games.every((game) => game.genres.includes("Indie"))).toBeTruthy();
});

test("E2E catalog pagination: out-of-range page is clamped", async ({ request }) => {
  const response = await request.get("/api/games?limit=12&q=arches&page=999");
  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as {
    games: Array<{ title: string }>;
    pagination: { page: number; total: number; totalPages: number };
  };

  expect(body.pagination.total).toBeGreaterThan(0);
  expect(body.pagination.totalPages).toBeGreaterThanOrEqual(1);
  expect(body.pagination.page).toBeLessThanOrEqual(body.pagination.totalPages);
  expect(body.games.length).toBeGreaterThan(0);
});

test("E2E social flow: follow user, view profile, and see followed reviews in feed", async ({ request, playwright, baseURL }) => {
  const gamesResponse = await request.get("/api/games?limit=1");
  expect(gamesResponse.ok()).toBeTruthy();
  const gamesBody = (await gamesResponse.json()) as GamesResponse;
  expect(gamesBody.games.length).toBeGreaterThan(0);
  const game = gamesBody.games[0];

  const timestamp = Date.now();
  const followerEmail = `follower_${timestamp}@fichin.test`;
  const followedEmail = `followed_${timestamp}@fichin.test`;
  const followerUsername = `follower_${timestamp}`;
  const followedUsername = `followed_${timestamp}`;
  const password = "StrongPass1";
  const effectiveBaseUrl = baseURL ?? "http://localhost:3000";

  await registerUser(request, followerEmail, followerUsername, password);
  await registerUser(request, followedEmail, followedUsername, password);

  const followerCtx = await playwright.request.newContext({ baseURL: effectiveBaseUrl });
  const followedCtx = await playwright.request.newContext({ baseURL: effectiveBaseUrl });

  await loginWithCredentials(followerCtx, effectiveBaseUrl, followerEmail, password);
  await loginWithCredentials(followedCtx, effectiveBaseUrl, followedEmail, password);

  const followedReview = await followedCtx.post("/api/reviews", {
    data: {
      gameId: game.id,
      score: 88,
      content: "Review from followed user",
    },
  });
  expect(followedReview.status()).toBe(200);

  const followResponse = await followerCtx.post("/api/follows", {
    data: { username: followedUsername },
  });
  expect(followResponse.status()).toBe(200);

  const followedProfile = await followerCtx.get(`/users/${followedUsername}`);
  expect(followedProfile.status()).toBe(200);
  const followedProfileHtml = await followedProfile.text();
  expect(followedProfileHtml).toContain(followedUsername);
  expect(followedProfileHtml).toContain("Review from followed user");

  const feedResponse = await followerCtx.get("/feed");
  expect(feedResponse.status()).toBe(200);
  const feedHtml = await feedResponse.text();
  expect(feedHtml).toContain(followedUsername);
  expect(feedHtml).toContain("Review from followed user");

  await followerCtx.dispose();
  await followedCtx.dispose();
});

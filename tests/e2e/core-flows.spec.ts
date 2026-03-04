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
  expect(Math.round(detailBody.averageScore ?? 0)).toBe(91);
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
});

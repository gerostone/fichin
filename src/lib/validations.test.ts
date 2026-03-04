import { describe, expect, test } from "vitest";

import { reviewSchema } from "@/lib/validations";

describe("reviewSchema", () => {
  test("accepts score in range 1..100", () => {
    const parsed = reviewSchema.safeParse({
      gameId: "5f0df8ed-8ea5-4d9d-b8ca-98459f1174a7",
      score: 85,
      content: "Excelente juego.",
    });

    expect(parsed.success).toBe(true);
  });

  test("rejects out-of-range score", () => {
    const parsed = reviewSchema.safeParse({
      gameId: "5f0df8ed-8ea5-4d9d-b8ca-98459f1174a7",
      score: 101,
      content: "Texto válido.",
    });

    expect(parsed.success).toBe(false);
  });
});

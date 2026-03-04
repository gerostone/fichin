import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores."),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/, "Password must include one uppercase letter.")
    .regex(/[a-z]/, "Password must include one lowercase letter.")
    .regex(/[0-9]/, "Password must include one number."),
});

export const reviewSchema = z.object({
  gameId: z.uuid(),
  score: z.number().int().min(1).max(100),
  content: z.string().min(3).max(2000),
});

export const userGameSchema = z.object({
  gameId: z.uuid(),
  status: z.enum(["WISHLIST", "PLAYED"]),
});

export const gameQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  genre: z.string().trim().max(50).optional(),
  platform: z.string().trim().max(50).optional(),
  sort: z.enum(["rating", "recent", "title"]).default("rating"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const followSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores."),
});

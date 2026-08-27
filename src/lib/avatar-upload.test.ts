import { describe, expect, test } from "vitest";

import {
  getAvatarExtension,
  isAllowedAvatarImageType,
  isAllowedAvatarMimeType,
  isVercelBlobUrl,
  validateAvatarDimensions,
} from "@/lib/avatar-upload";

describe("avatar upload rules", () => {
  test("allows only jpeg and png mime types", () => {
    expect(isAllowedAvatarMimeType("image/jpeg")).toBe(true);
    expect(isAllowedAvatarMimeType("image/png")).toBe(true);
    expect(isAllowedAvatarMimeType("image/webp")).toBe(false);
  });

  test("allows only jpg/jpeg/png detected image types", () => {
    expect(isAllowedAvatarImageType("jpg")).toBe(true);
    expect(isAllowedAvatarImageType("jpeg")).toBe(true);
    expect(isAllowedAvatarImageType("png")).toBe(true);
    expect(isAllowedAvatarImageType("gif")).toBe(false);
    expect(isAllowedAvatarImageType(undefined)).toBe(false);
  });

  test("rejects missing dimensions", () => {
    expect(validateAvatarDimensions(undefined, 1200)).toBe("Could not read image dimensions");
  });

  test("rejects dimensions above 4096px", () => {
    expect(validateAvatarDimensions(4097, 1200)).toBe("Avatar dimensions must be at most 4096px x 4096px");
  });

  test("accepts valid dimensions", () => {
    expect(validateAvatarDimensions(4096, 4096)).toBeNull();
  });

  test("maps mime type to file extension", () => {
    expect(getAvatarExtension("image/png")).toBe("png");
    expect(getAvatarExtension("image/jpeg")).toBe("jpg");
  });

  test("recognizes vercel blob URLs", () => {
    expect(isVercelBlobUrl("https://x.public.blob.vercel-storage.com/avatar.jpg")).toBe(true);
    expect(isVercelBlobUrl("https://example.com/avatar.jpg")).toBe(false);
  });
});

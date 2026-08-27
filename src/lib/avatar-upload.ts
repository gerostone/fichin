export const MAX_AVATAR_DIMENSION_PX = 4096;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png"]);
const ALLOWED_IMAGE_TYPES = new Set(["jpg", "jpeg", "png"]);

export function isAllowedAvatarMimeType(mimeType: string) {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

export function isAllowedAvatarImageType(imageType?: string) {
  if (!imageType) {
    return false;
  }

  return ALLOWED_IMAGE_TYPES.has(imageType);
}

export function validateAvatarDimensions(width?: number, height?: number) {
  if (!width || !height) {
    return "Could not read image dimensions";
  }

  if (width > MAX_AVATAR_DIMENSION_PX || height > MAX_AVATAR_DIMENSION_PX) {
    return `Avatar dimensions must be at most ${MAX_AVATAR_DIMENSION_PX}px x ${MAX_AVATAR_DIMENSION_PX}px`;
  }

  return null;
}

export function getAvatarExtension(mimeType: string) {
  if (mimeType === "image/png") {
    return "png";
  }

  return "jpg";
}

export function isVercelBlobUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

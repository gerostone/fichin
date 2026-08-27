import { NextRequest, NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import { imageSize } from "image-size";

import { getAuthSession } from "@/lib/auth";
import {
  getAvatarExtension,
  isAllowedAvatarImageType,
  isAllowedAvatarMimeType,
  isVercelBlobUrl,
  validateAvatarDimensions,
} from "@/lib/avatar-upload";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Avatar storage is not configured" }, { status: 500 });
  }

  const formData = await request.formData().catch(() => null);
  const avatarFile = formData?.get("avatar");

  if (!(avatarFile instanceof File)) {
    return NextResponse.json({ error: "Invalid file payload" }, { status: 400 });
  }

  if (!isAllowedAvatarMimeType(avatarFile.type)) {
    return NextResponse.json({ error: "Avatar must be JPEG or PNG format" }, { status: 400 });
  }

  const avatarBuffer = Buffer.from(await avatarFile.arrayBuffer());
  const detected = imageSize(avatarBuffer);

  if (!isAllowedAvatarImageType(detected.type)) {
    return NextResponse.json({ error: "Avatar must be JPEG or PNG format" }, { status: 400 });
  }

  const dimensionsError = validateAvatarDimensions(detected.width, detected.height);
  if (dimensionsError) {
    return NextResponse.json({ error: dimensionsError }, { status: 400 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarUrl: true },
  });

  const blob = await put(
    `avatars/${session.user.id}-${Date.now()}.${getAvatarExtension(avatarFile.type)}`,
    avatarBuffer,
    {
      access: "public",
      addRandomSuffix: true,
      contentType: avatarFile.type,
    },
  );

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: blob.url },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
    },
  });

  if (currentUser?.avatarUrl && isVercelBlobUrl(currentUser.avatarUrl) && currentUser.avatarUrl !== blob.url) {
    await del(currentUser.avatarUrl).catch(() => null);
  }

  return NextResponse.json({ user: updatedUser });
}

export async function DELETE() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Avatar storage is not configured" }, { status: 500 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarUrl: true },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: null },
  });

  if (currentUser?.avatarUrl && isVercelBlobUrl(currentUser.avatarUrl)) {
    await del(currentUser.avatarUrl).catch(() => null);
  }

  return NextResponse.json({ ok: true });
}

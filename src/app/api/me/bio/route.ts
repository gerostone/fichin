import { NextRequest, NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bioUpdateSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bioUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const normalizedBio = parsed.data.bio?.trim() ?? "";

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      bio: normalizedBio.length > 0 ? normalizedBio : null,
    },
    select: {
      id: true,
      username: true,
      bio: true,
    },
  });

  return NextResponse.json({ user });
}

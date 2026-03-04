import { NextRequest, NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { avatarUpdateSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = avatarUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: parsed.data.avatarUrl },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
    },
  });

  return NextResponse.json({ user: updatedUser });
}

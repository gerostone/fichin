import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";

export default async function MyProfileRedirectPage() {
  const session = await getAuthSession();
  if (!session?.user?.username) {
    redirect("/auth/signin?callbackUrl=/me");
  }

  redirect(`/users/${session.user.username}`);
}

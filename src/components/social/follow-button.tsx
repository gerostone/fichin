"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FollowButtonProps = {
  username: string;
  initiallyFollowing: boolean;
};

export function FollowButton({ username, initiallyFollowing }: FollowButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initiallyFollowing);
  const [loading, setLoading] = useState(false);

  async function toggleFollow() {
    try {
      setLoading(true);

      if (isFollowing) {
        const response = await fetch(`/api/follows/${encodeURIComponent(username)}`, { method: "DELETE" });
        if (!response.ok) {
          throw new Error("No se pudo dejar de seguir al usuario.");
        }
        setIsFollowing(false);
      } else {
        const response = await fetch("/api/follows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        if (!response.ok) {
          throw new Error("No se pudo seguir al usuario.");
        }

        setIsFollowing(true);
      }

      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Acción no disponible";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`min-h-11 rounded-xl px-4 py-2 text-sm font-semibold ${
        isFollowing ? "border border-orange-300/70 text-orange-100" : "bg-cyan-500 text-slate-950"
      }`}
    >
      {loading ? "Procesando..." : isFollowing ? "Dejar de seguir" : "Seguir"}
    </button>
  );
}

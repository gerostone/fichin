"use client";

import { UserGameStatus } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SaveGameFormProps = {
  gameId: string;
  initialStatus: UserGameStatus | null;
};

export function SaveGameForm({ gameId, initialStatus }: SaveGameFormProps) {
  const router = useRouter();
  const { status } = useSession();
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<UserGameStatus | null>(initialStatus);

  async function save(statusValue: UserGameStatus) {
    if (status !== "authenticated") {
      router.push("/auth/signin");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/user-games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, status: statusValue }),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el juego.");
      }

      setSelected(statusValue);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el juego");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <button
        onClick={() => save("WISHLIST")}
        disabled={saving}
        className={`min-h-11 rounded-xl px-4 py-2 text-sm font-semibold ${
          selected === "WISHLIST"
            ? "bg-cyan-500 text-slate-950"
            : "border border-cyan-300/50 bg-cyan-500/10 text-cyan-100"
        }`}
      >
        {saving ? "Guardando..." : "Guardar en wishlist"}
      </button>

      <button
        onClick={() => save("PLAYED")}
        disabled={saving}
        className={`min-h-11 rounded-xl px-4 py-2 text-sm font-semibold ${
          selected === "PLAYED"
            ? "bg-orange-400 text-slate-950"
            : "border border-orange-300/50 bg-orange-500/10 text-orange-100"
        }`}
      >
        {saving ? "Guardando..." : "Marcar como jugado"}
      </button>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfileAvatarEditorProps = {
  username: string;
  avatarUrl: string | null;
  avatarColor: string;
  initials: string;
};

export function ProfileAvatarEditor({ username, avatarUrl, avatarColor, initials }: ProfileAvatarEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(avatarUrl ?? "");
  const [loading, setLoading] = useState(false);

  async function onSave() {
    const normalizedValue = value.trim();

    if (normalizedValue.length > 0) {
      try {
        const parsed = new URL(normalizedValue);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          alert("La URL debe comenzar con http:// o https://");
          return;
        }
      } catch {
        alert("URL inválida");
        return;
      }
    }

    try {
      setLoading(true);

      const response = await fetch("/api/me/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: normalizedValue.length > 0 ? normalizedValue : null }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar la foto de perfil.");
      }

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la foto de perfil.";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsEditing((prev) => !prev)}
        className="group relative block h-24 w-24 rounded-full border border-white/20"
        aria-label="Editar foto de perfil"
      >
        {avatarUrl ? (
          <div
            className="h-full w-full rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url(${avatarUrl})` }}
            aria-hidden
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center rounded-full text-2xl font-bold text-slate-950"
            style={{ background: `radial-gradient(circle at 20% 20%, #ffffff, ${avatarColor})` }}
            aria-hidden
          >
            {initials}
          </div>
        )}

        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/0 opacity-0 transition group-hover:bg-slate-950/55 group-hover:opacity-100">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </span>
      </button>

      {isEditing ? (
        <div className="absolute left-0 top-28 z-20 w-72 rounded-xl border border-white/15 bg-slate-950 p-3 shadow-xl">
          <p className="mb-2 text-xs font-semibold tracking-[0.08em] text-slate-300">FOTO DE PERFIL</p>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          />
          <p className="mt-2 text-[11px] text-slate-400">Ingresá una URL de imagen (http/https).</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={loading}
              className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("");
              }}
              disabled={loading}
              className="rounded-lg border border-orange-300/70 px-3 py-2 text-xs font-semibold text-orange-100"
            >
              Quitar foto
            </button>
          </div>
        </div>
      ) : null}

      <span className="sr-only">Editar foto de perfil para @{username}</span>
    </div>
  );
}

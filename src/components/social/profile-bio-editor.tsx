"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfileBioEditorProps = {
  bio: string | null;
  isEditable: boolean;
  emptyText?: string;
};

export function ProfileBioEditor({ bio, isEditable, emptyText = "Este usuario aún no agregó una biografía." }: ProfileBioEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(bio ?? "");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSave() {
    try {
      setLoading(true);
      setErrorMessage(null);

      const response = await fetch("/api/me/bio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: value.trim().length > 0 ? value.trim() : null }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar la biografía.");
      }

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la biografía.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <div className="flex items-start gap-2">
        {isEditable ? (
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-slate-300 transition hover:border-cyan-300/70 hover:text-cyan-100"
            aria-label="Editar biografía"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
        ) : (
          <span
            title="Solo el dueño del perfil puede editar esta biografía."
            className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-slate-500"
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </span>
        )}

        <p className="max-w-2xl text-sm text-slate-300">{bio?.trim() ? bio : emptyText}</p>
      </div>

      {isEditable && isEditing ? (
        <div className="mt-3 max-w-xl space-y-2 rounded-xl border border-white/15 bg-slate-950/80 p-3">
          <textarea
            value={value}
            maxLength={240}
            onChange={(event) => setValue(event.target.value)}
            rows={3}
            placeholder="Contá algo sobre vos..."
            className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-400">{value.trim().length}/240</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setValue(bio ?? "");
                  setIsEditing(false);
                  setErrorMessage(null);
                }}
                className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={loading}
                className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
          {errorMessage ? <p className="text-xs text-red-300">{errorMessage}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

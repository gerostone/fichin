"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ReviewFormProps = {
  gameId: string;
  initialScore?: number;
  initialContent?: string;
  reviewId?: string;
};

export function ReviewForm({ gameId, initialScore = 80, initialContent = "", reviewId }: ReviewFormProps) {
  const { status } = useSession();
  const router = useRouter();
  const [score, setScore] = useState(initialScore);
  const [content, setContent] = useState(initialContent);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (status !== "authenticated") {
      router.push("/auth/signin");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, score, content }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "No se pudo enviar la reseña.");
      }

      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo enviar la reseña";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!reviewId) return;

    const confirmed = window.confirm("¿Seguro que querés borrar tu reseña?");
    if (!confirmed) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("No se pudo borrar la reseña.");
      }
      setContent("");
      setScore(80);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("No se pudo borrar la reseña");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div>
        <label htmlFor="score" className="mb-2 block text-sm font-medium text-slate-200">
          Puntaje (1 a 100)
        </label>
        <input
          id="score"
          type="number"
          min={1}
          max={100}
          value={score}
          onChange={(event) => setScore(Number(event.target.value))}
          className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="mb-2 block text-sm font-medium text-slate-200">
          Tu reseña
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-36 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
          maxLength={2000}
          minLength={3}
          required
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="min-h-11 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          {submitting ? "Guardando..." : reviewId ? "Actualizar reseña" : "Publicar reseña"}
        </button>

        {reviewId ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            className="min-h-11 rounded-xl border border-orange-300/70 px-4 py-2 text-sm font-semibold text-orange-100"
          >
            Borrar
          </button>
        ) : null}
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, useState } from "react";

type ProfileAvatarEditorProps = {
  username: string;
  avatarUrl: string | null;
  avatarColor: string;
  initials: string;
};

export function ProfileAvatarEditor({ username, avatarUrl, avatarColor, initials }: ProfileAvatarEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setErrorMessage(null);
    setPreviewUrl(null);
    setSelectedFile(null);

    if (!file) {
      return;
    }

    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      setErrorMessage("La foto debe estar en formato JPEG o PNG.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.src = objectUrl;
    await new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.onerror = () => resolve();
    });

    if (!image.width || !image.height) {
      URL.revokeObjectURL(objectUrl);
      setErrorMessage("No se pudo leer la imagen seleccionada.");
      return;
    }

    if (image.width > 4096 || image.height > 4096) {
      URL.revokeObjectURL(objectUrl);
      setErrorMessage("La imagen no puede superar 4096px por lado.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  }

  async function onUpload() {
    if (!selectedFile) {
      setErrorMessage("Seleccioná un archivo JPEG o PNG.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const response = await fetch("/api/me/avatar", {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "No se pudo actualizar la foto de perfil.");
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(null);
      setPreviewUrl(null);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la foto de perfil.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  async function onRemove() {
    try {
      setLoading(true);
      setErrorMessage(null);

      const response = await fetch("/api/me/avatar", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo quitar la foto de perfil.");
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(null);
      setPreviewUrl(null);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo quitar la foto de perfil.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  const visibleAvatarUrl = previewUrl ?? avatarUrl;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setIsEditing((prev) => {
            const next = !prev;
            if (!next && previewUrl) {
              URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
              setSelectedFile(null);
              setErrorMessage(null);
            }
            return next;
          });
        }}
        className="group relative block h-24 w-24 rounded-full border border-white/20"
        aria-label="Editar foto de perfil"
      >
        {visibleAvatarUrl ? (
          <div
            className="h-full w-full rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url(${visibleAvatarUrl})` }}
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
          <label className="block w-full cursor-pointer rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100">
            <span>{selectedFile ? selectedFile.name : "Seleccionar imagen..."}</span>
            <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={onFileChange} />
          </label>
          <p className="mt-2 text-[11px] text-slate-400">Formatos permitidos: JPEG/PNG. Máximo: 4096x4096.</p>
          {errorMessage ? <p className="mt-2 text-[11px] text-red-300">{errorMessage}</p> : null}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onUpload}
              disabled={loading}
              className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950"
            >
              {loading ? "Subiendo..." : "Subir"}
            </button>
            <button
              type="button"
              onClick={onRemove}
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

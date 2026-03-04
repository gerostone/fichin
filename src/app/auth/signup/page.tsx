"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "No se pudo crear la cuenta.");
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!signInResult || signInResult.error) {
        throw new Error("Cuenta creada, pero no se pudo iniciar sesión automáticamente.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-3xl font-bold">Crear cuenta</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <label className="block text-sm">
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2"
            required
          />
        </label>

        <label className="block text-sm">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2"
            required
          />
        </label>

        <label className="block text-sm">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2"
            required
          />
        </label>

        {error ? <p className="text-sm text-orange-300">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="min-h-11 w-full rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950"
        >
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-300">
        ¿Ya tenés cuenta? <Link href="/auth/signin" className="text-cyan-300">Iniciar sesión</Link>
      </p>
    </div>
  );
}

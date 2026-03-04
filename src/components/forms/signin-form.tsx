"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type SignInFormProps = {
  callbackUrl: string;
};

export function SignInForm({ callbackUrl }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Credenciales inválidas.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-3xl font-bold">Iniciar sesión</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
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
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-300">
        ¿No tenés cuenta? <Link href="/auth/signup" className="text-cyan-300">Crear cuenta</Link>
      </p>
    </div>
  );
}

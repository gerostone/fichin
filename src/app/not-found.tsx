import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center">
      <h1 className="text-3xl font-bold">Juego no encontrado</h1>
      <p className="mt-3 text-slate-300">El recurso que buscás no existe o fue removido.</p>
      <Link href="/dashboard" className="mt-5 inline-flex rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950">
        Volver al dashboard
      </Link>
    </div>
  );
}

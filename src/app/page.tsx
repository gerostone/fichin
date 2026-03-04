import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10 py-4">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 md:p-10">
        <p className="mb-3 inline-block rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold tracking-wider text-cyan-100">
          TU BITACORA DE VIDEOJUEGOS
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-100 md:text-6xl">
          Descubrí, guardá y reseñá los juegos que te marcaron.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300 md:text-lg">
          Fichin te deja puntuar del 1 al 100, escribir reseñas y construir tu historial en wishlist o jugados.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-500 px-5 py-2 font-semibold text-slate-950"
          >
            Explorar catálogo
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-300/70 px-5 py-2 font-semibold text-orange-100"
          >
            Crear cuenta
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h2 className="text-xl font-semibold">Buscar y filtrar</h2>
          <p className="mt-2 text-sm text-slate-300">
            Encontrá juegos famosos por título, género o plataforma en una experiencia responsive.
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h2 className="text-xl font-semibold">Guardar en dos estados</h2>
          <p className="mt-2 text-sm text-slate-300">Organizá cada juego como wishlist o jugado según tu progreso.</p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h2 className="text-xl font-semibold">Reseñar con puntaje 1-100</h2>
          <p className="mt-2 text-sm text-slate-300">Publicá tu opinión y actualizala cuando cambie tu percepción del juego.</p>
        </article>
      </section>
    </div>
  );
}

import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-lg text-center" aria-labelledby="titulo-404">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
        Error 404
      </p>
      <h1 id="titulo-404" className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
        Página no encontrada
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        La dirección que abriste no existe o fue movida. Vuelve al panel
        principal para continuar.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        Ir al dashboard
      </Link>
    </section>
  );
}

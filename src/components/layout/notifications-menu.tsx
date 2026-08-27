"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type NotificationItem = {
  id: string;
  type: "FOLLOW" | "REVIEW";
  createdAt: string;
  actorUsername: string;
  message: string;
  href: string;
};

function formatRelativeTime(dateIso: string) {
  const createdAt = new Date(dateIso).getTime();
  const diffMs = createdAt - Date.now();
  const minutes = Math.round(diffMs / (1000 * 60));

  const formatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  const days = Math.round(hours / 24);
  return formatter.format(days, "day");
}

export function NotificationsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadNotifications() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("No se pudieron cargar las notificaciones.");
      }

      const body = (await response.json()) as { notifications?: NotificationItem[] };
      setNotifications(body.notifications ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar las notificaciones.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  const badgeCount = useMemo(() => notifications.length, [notifications.length]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-slate-900/80 text-slate-100 transition hover:border-cyan-300/60 hover:text-cyan-200"
        aria-label="Notificaciones"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M13.02 2.37 6.72 13h4.58l-1.3 8.63L17.3 11h-4.5l.22-8.63Z" />
        </svg>
        {badgeCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-slate-950">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-2 w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/15 bg-slate-950/98 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold tracking-[0.08em] text-slate-200 uppercase">Notificaciones</p>
            <button
              type="button"
              onClick={loadNotifications}
              className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {error ? <p className="p-4 text-sm text-red-300">{error}</p> : null}

            {!error && notifications.length === 0 ? (
              <p className="p-4 text-sm text-slate-300">No tenés notificaciones por ahora.</p>
            ) : null}

            {!error &&
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() => setIsOpen(false)}
                  className="block border-b border-white/5 px-4 py-3 transition hover:bg-slate-900/80"
                >
                  <p className="text-sm text-slate-100">{notification.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(notification.createdAt)}</p>
                </Link>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

# Arquitectura

## Visión general

Fichin está implementado como un monolito web full-stack con Next.js App Router:

- Render de UI (SSR/Server Components + Client Components puntuales).
- APIs internas en `src/app/api/*`.
- Persistencia en PostgreSQL vía Prisma.
- Auth centralizada con NextAuth (credentials + JWT).

## Capas

### Presentación (UI)

- Layout global: `src/app/layout.tsx`
- Navegación:
  - Desktop: `src/components/layout/top-nav.tsx`
  - Mobile: `src/components/layout/mobile-nav.tsx`
- Pantallas:
  - Landing: `src/app/page.tsx`
  - Auth: `src/app/auth/*`
  - Dashboard: `src/app/dashboard/page.tsx`
  - Detalle juego: `src/app/games/[slug]/page.tsx`
  - Biblioteca: `src/app/me/library/page.tsx`
  - Mis reseñas: `src/app/me/reviews/page.tsx`

### Dominio/servicios

- `src/lib/validations.ts`: esquemas de entrada con `zod`.
- `src/lib/sanitize.ts`: limpieza de contenido de reseñas.
- `src/lib/rate-limit.ts`: rate limit in-memory por endpoint/IP.

### Datos

- Prisma Client singleton: `src/lib/prisma.ts`.
- Schema y relaciones: `prisma/schema.prisma`.
- Seed: `prisma/seed.ts`.

### Seguridad/Auth

- Config NextAuth: `src/lib/auth-options.ts`.
- Helper de sesión server-side: `src/lib/auth.ts`.
- Protección de rutas/API: `src/proxy.ts`.
  - `/api/*` protegidas retornan `401` JSON sin sesión.
  - rutas web protegidas redirigen a signin.

## Flujo principal (reseñar juego)

1. Usuario autenticado abre `/games/[slug]`.
2. Carga detalle + estado en biblioteca + reseña propia + reseñas recientes.
3. Envía form a `POST /api/reviews`.
4. API valida payload (`zod`), sanitiza texto, upsert en `Review`.
5. UI refresca y muestra agregado actualizado.

## Decisiones importantes

- `UserGame` usa `unique(userId, gameId)` para evitar duplicados.
- `Review` usa `unique(userId, gameId)` para 1 reseña editable por usuario/juego.
- Score validado estrictamente 1..100.
- Catálogo persistido localmente para búsqueda rápida y estable.

## Limitaciones actuales

- Rate limit in-memory (no distribuido, se reinicia al reiniciar proceso).
- No OAuth social (solo credentials).
- Sin sistema de observabilidad centralizado (logs básicos).

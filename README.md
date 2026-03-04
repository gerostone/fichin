# Fichin

Web app responsive para buscar, guardar y reseñar videojuegos.

## Qué incluye

- Catálogo de videojuegos (seed local + opción de importar desde IGDB).
- Registro e inicio de sesión con email/contraseña.
- Dashboard con búsqueda, filtros y paginación.
- Biblioteca personal con estados `WISHLIST` y `PLAYED`.
- Reseñas editables con puntaje de `1` a `100`.
- APIs protegidas y validadas con `zod`.
- Suite de tests unitarios y E2E.

## Stack

- `Next.js 16` (App Router)
- `TypeScript`
- `Prisma` + `PostgreSQL`
- `NextAuth` (credentials + JWT session)
- `Tailwind CSS`
- `Vitest` + `Playwright`

## Estructura principal

- `src/app`: páginas App Router y route handlers (`/api/*`)
- `src/components`: componentes de layout/UI/formularios
- `src/lib`: auth, prisma, validaciones, sanitización, rate limiting
- `prisma`: schema, seed y dataset fallback
- `tests/e2e`: flujos end-to-end
- `docs`: documentación técnica detallada

## Quick Start

### 1) Instalar dependencias

```bash
npm install
```

### 2) Configurar variables de entorno

Copiar `.env.example` a `.env` y ajustar valores.

```env
DATABASE_URL="postgresql://<usuario>@localhost:5432/fichin"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<secret-largo-aleatorio>"
IGDB_CLIENT_ID=""
IGDB_CLIENT_SECRET=""
```

### 3) Crear base y sincronizar schema

```bash
createdb -h localhost fichin
npm run db:push
```

### 4) Seed del catálogo

```bash
npm run db:seed
```

### 5) Levantar app

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev`: servidor de desarrollo
- `npm run build`: build de producción
- `npm run start`: servir build de producción
- `npm run lint`: lint
- `npm run test`: tests unitarios (Vitest)
- `npm run test:e2e`: tests E2E (Playwright)
- `npm run db:generate`: genera Prisma Client
- `npm run db:push`: sincroniza schema con DB
- `npm run db:migrate`: migraciones de desarrollo
- `npm run db:seed`: carga catálogo inicial

## Documentación técnica

- [Arquitectura](docs/ARCHITECTURE.md)
- [Modelo de datos](docs/DATABASE.md)
- [API REST](docs/API.md)
- [Testing](docs/TESTING.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Estado actual

Implementado y verificado:

- Lint: OK
- Unit tests: OK
- E2E tests: OK
- Build: OK

## Notas

- `prisma.seed` en `package.json` funciona actualmente, pero Prisma indica deprecación hacia `prisma.config.ts` en versiones futuras.
- Sin `IGDB_CLIENT_ID` y `IGDB_CLIENT_SECRET`, el seed usa `prisma/data/famous-games.json`.

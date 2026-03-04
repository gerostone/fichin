# Base de Datos

## Motor

- PostgreSQL
- ORM: Prisma

## Modelos

### `User`

- `id`: UUID (PK)
- `email`: único
- `username`: único
- `passwordHash`: string
- `createdAt`, `updatedAt`

Relaciones:
- `reviews` (1:N)
- `userGames` (1:N)

### `Game`

- `id`: UUID (PK)
- `externalId`: único opcional
- `title`, `slug` (slug único)
- `coverUrl`
- `releaseDate`
- `genres`: `String[]`
- `platforms`: `String[]`
- `summary`
- `ratingGlobal`
- `createdAt`, `updatedAt`

Relaciones:
- `reviews` (1:N)
- `userGames` (1:N)

### `UserGame`

- `id`: UUID (PK)
- `userId`, `gameId` (FK)
- `status`: enum `WISHLIST | PLAYED`
- `createdAt`, `updatedAt`

Restricción:
- `@@unique([userId, gameId])`

### `Review`

- `id`: UUID (PK)
- `userId`, `gameId` (FK)
- `score`: int (validado en aplicación)
- `content`: text
- `createdAt`, `updatedAt`

Restricción:
- `@@unique([userId, gameId])`

## Índices

- `Game.title`, `Game.slug`
- `Review.gameId`, `Review.userId`
- `User.email`, `User.username`

## Seed

Archivo: `prisma/seed.ts`

Estrategia:
1. Si existen `IGDB_CLIENT_ID` y `IGDB_CLIENT_SECRET`, obtiene token OAuth2 de Twitch e importa juegos populares desde IGDB.
2. Si no existe o falla, usa fallback local `prisma/data/famous-games.json`.

Comando:

```bash
npm run db:seed
```

## Operación diaria

- Sincronizar schema local:

```bash
npm run db:push
```

- Regenerar cliente Prisma:

```bash
npm run db:generate
```

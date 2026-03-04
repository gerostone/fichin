# API

Base path: `/api`

## Auth

### `POST /api/auth/register`

Crea un usuario con credentials.

Request:

```json
{
  "email": "user@example.com",
  "username": "user_01",
  "password": "StrongPass1"
}
```

Responses:
- `201`: usuario creado
- `400`: payload inválido
- `409`: email o username ya existente
- `429`: rate limit

### `GET|POST /api/auth/[...nextauth]`

Rutas internas de NextAuth (signin/session/csrf/callback).

## Games

### `GET /api/games`

Query params:
- `q`: string
- `genre`: string
- `platform`: string
- `sort`: `rating | recent | title`
- `page`: number >= 1
- `limit`: 1..50

Response:

```json
{
  "games": [
    {
      "id": "uuid",
      "title": "...",
      "slug": "...",
      "averageScore": 90,
      "reviewCount": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "totalPages": 9
  }
}
```

### `GET /api/games/:id`

`id` acepta UUID interno o slug.

Response:
- `game`
- `averageScore`
- `reviewCount`
- `recentReviews`

## User Library

### `GET /api/user-games`

Auth requerida.

Query param opcional:
- `status`: `WISHLIST | PLAYED`

Responses:
- `200`
- `401` sin sesión

### `POST /api/user-games`

Auth requerida.

Request:

```json
{
  "gameId": "uuid",
  "status": "WISHLIST"
}
```

Comportamiento: upsert por `(userId, gameId)`.

Responses:
- `200`
- `400`
- `401`
- `404` juego no existe

## Reviews

### `POST /api/reviews`

Auth requerida.

Request:

```json
{
  "gameId": "uuid",
  "score": 91,
  "content": "Excelente juego"
}
```

Reglas:
- `score` 1..100
- `content` 3..2000
- sanitización de HTML tags
- upsert por `(userId, gameId)`

Responses:
- `200`
- `400`
- `401`
- `404`
- `429`

### `DELETE /api/reviews/:id`

Auth requerida.

Responses:
- `200` autor correcto
- `401` sin sesión
- `403` no autor
- `404` no existe

## Social Graph (Follow)

### `GET /api/follows`

Auth requerida.

Devuelve la lista de usuarios que sigue el usuario actual.

Responses:
- `200`
- `401` sin sesión

### `POST /api/follows`

Auth requerida.

Request:

```json
{
  "username": "otro_usuario"
}
```

Reglas:
- no se puede seguir a uno mismo
- upsert por `(followerId, followingId)` para evitar duplicados

Responses:
- `200`
- `400` payload inválido o self-follow
- `401` sin sesión
- `404` usuario objetivo no existe

### `DELETE /api/follows/:username`

Auth requerida.

Elimina relación de follow si existe.

Responses:
- `200`
- `401` sin sesión
- `404` usuario objetivo no existe

## Errores comunes

Formato general:

```json
{ "error": "..." }
```

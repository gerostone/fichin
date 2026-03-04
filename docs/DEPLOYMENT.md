# Deployment (Vercel + Neon)

## Estado actual

- Producción activa: [https://fichin.vercel.app](https://fichin.vercel.app)
- Hosting: Vercel
- Base de datos: Neon PostgreSQL

## Variables de entorno (Production)

Configurar en Vercel:

- `DATABASE_URL`: cadena de conexión de Neon (pooled, `sslmode=require`)
- `NEXTAUTH_URL`: `https://fichin.vercel.app`
- `NEXTAUTH_SECRET`: secret largo y aleatorio
- `IGDB_CLIENT_ID`: credencial Twitch/IGDB
- `IGDB_CLIENT_SECRET`: credencial Twitch/IGDB

## Flujo recomendado de primer deploy

1. Conectar repo GitHub en Vercel.
2. Configurar variables de entorno de producción.
3. Aplicar schema a Neon:

```bash
DATABASE_URL="<neon-url>" npm run db:push
```

4. Cargar catálogo inicial desde IGDB:

```bash
DATABASE_URL="<neon-url>" npm run db:seed
```

5. Lanzar deploy de producción:

```bash
npx vercel --prod --yes
```

## Validaciones post-deploy

- Home: `https://fichin.vercel.app/`
- API catálogo: `https://fichin.vercel.app/api/games?limit=3`
- Login/registro funcional
- Dashboard protegido
- Guardado `WISHLIST`/`PLAYED`
- Reseñas 1..100
- Perfil propio (`/me`) y perfil público (`/users/[username]`)
- Follow/unfollow funcional
- Feed social (`/feed`) con reseñas de seguidos

## Redeploy manual

Cada push a `main` redeploya automáticamente por integración GitHub/Vercel.

También podés forzar desde CLI:

```bash
npx vercel --prod --yes
```

## Notas operativas

- Si cambiás `NEXTAUTH_SECRET`, se invalidan cookies de sesión activas.
- Si falla IGDB o faltan credenciales, el seed usa fallback local (`prisma/data/famous-games.json`).
- Evitar exponer `IGDB_CLIENT_SECRET` y `DATABASE_URL` en frontend o logs.

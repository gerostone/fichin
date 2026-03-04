# Troubleshooting

## `401 Unauthorized` en `/api/user-games` o `/api/reviews`

Causa: endpoint protegido y sesión inexistente/expirada.

Verificar:
- sesión activa en `/api/auth/session`
- `NEXTAUTH_SECRET` estable en `.env`

## `401 Unauthorized` en `/api/follows` o redirect en `/feed`

Causa: rutas sociales protegidas sin sesión válida.

Verificar:
- login activo
- cookie de sesión vigente
- `NEXTAUTH_URL` y `NEXTAUTH_SECRET` correctos en entorno actual

## `JWT_SESSION_ERROR decryption operation failed`

Causa típica: cambió `NEXTAUTH_SECRET` y quedó cookie vieja.

Solución:
- borrar cookies de `localhost`
- reiniciar sesión

## `prisma db push` falla con permisos en sandbox

En algunos entornos restringidos, acceder a `localhost:5432` requiere permisos elevados.

Acciones:
- confirmar que PostgreSQL está activo
- confirmar que la DB existe
- ejecutar comando fuera del sandbox si aplica

## `prisma db seed` falla con `tsx` IPC/EPERM

Causa: restricciones del entorno para sockets IPC.

Solución:
- ejecutar con permisos que permitan IPC local

## Build falla por fuentes remotas

Si hay bloqueo de red, evitar dependencias de `next/font/google`.

Estado en Fichin:
- se usan stacks locales en CSS, no requiere descargar fuentes.

## Falla auth por callback URL

Verificar:
- `NEXTAUTH_URL` correcto (ej. `http://localhost:3000`)
- acceso consistente por mismo host/puerto

## Seed no trae IGDB

Si `IGDB_CLIENT_ID` o `IGDB_CLIENT_SECRET` están vacíos, o falla la red/OAuth, se usa fallback local automáticamente.

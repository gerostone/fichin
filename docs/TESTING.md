# Testing

## Tipos de tests

### Unit

- Framework: Vitest
- Archivos:
  - `src/lib/validations.test.ts` (score de reseñas)
  - `src/lib/avatar-upload.test.ts` (reglas de avatar: mime, dimensiones, URL blob)

Ejecutar:

```bash
npm run test
```

### E2E

- Framework: Playwright
- Config: `playwright.config.ts`
- Suite: `tests/e2e/core-flows.spec.ts`

La suite valida:
1. Registro de usuario.
2. Login con credentials y sesión válida.
3. Guardar juego en `WISHLIST`.
4. Actualizar a `PLAYED` sin duplicar registro.
5. Rechazo de score inválido (`101`) con `400`.
6. Reseña válida y verificación de agregados.
7. Biblioteca autenticada (`/me/library?status=PLAYED`).
8. Borrado de reseña por autor.
9. APIs protegidas retornan `401` sin sesión.
10. Follow entre usuarios.
11. Acceso a perfil público de otro usuario.
12. Feed con reseñas de usuarios seguidos.
13. Endpoint de avatar protegido retorna `401` sin sesión.

Ejecutar:

```bash
npm run test:e2e
```

## Requisitos para correr tests

- DB levantada y accesible por `DATABASE_URL`.
- Schema sincronizado:

```bash
npm run db:push
```

- Catálogo cargado:

```bash
npm run db:seed
```

## CI recomendado

Orden sugerido:

```bash
npm ci
npm run db:generate
npm run db:push
npm run db:seed
npm run lint
npm run test
npm run test:e2e
npm run build
```

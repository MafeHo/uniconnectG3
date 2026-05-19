# @uniconnect/api-types

Paquete de tipos TypeScript autogenerados y esquemas Zod centralizados para el monorepo UniConnect G3.

---

## Contenido

```
packages/api-types/
├── scripts/
│   └── generate-types.ts      # Transforma openapi.json → openapi.d.ts
├── src/
│   ├── generated/
│   │   ├── openapi.d.ts        # Tipos autogenerados (NO editar manualmente)
│   │   └── index.ts            # Re-exporta openapi.d.ts
│   ├── schemas/
│   │   ├── auth.schema.ts      # Esquemas Zod de auth-service
│   │   ├── user.schema.ts      # Esquemas Zod de user-service
│   │   ├── chat.schema.ts      # Esquemas Zod de chat-service
│   │   ├── social.schema.ts    # Esquemas Zod de social-service
│   │   ├── academic.schema.ts  # Esquemas Zod de academic-service
│   │   ├── notification.schema.ts  # Esquemas Zod de notification-service
│   │   └── index.ts            # Agrupa todos los schemas
│   └── index.ts                # Punto de entrada principal del paquete
├── CHANGELOG.md
├── package.json
└── tsconfig.json
```

---

## Gestión de Contratos y OpenAPI

### Flujo de trabajo

```
Zod Schemas (microservicios)
        ↓
Gateway registry.ts consolida
        ↓
generator.ts crea openapi.json
        ↓
generate-types.ts crea openapi.d.ts
        ↓
Frontend Web / App Móvil lo consume con tipos seguros
```

### Cómo agregar un nuevo endpoint

1. **Escribe los schemas Zod** en el microservicio correspondiente (`src/domain/dtos/schemas.ts`):
   ```typescript
   export const MiRequestSchema = z.object({
     campo: z.string()
   });
   export const MiResponseSchema = z.object({
     resultado: z.string()
   });
   ```

2. **Usa el schema en el controlador** para validar la request:
   ```typescript
   const body = MiRequestSchema.parse(req.body);
   ```

3. **Registra la ruta** en el Gateway (`gateway/src/openapi/schemas/*.ts`):
   ```typescript
   registry.registerPath({
     method: 'post',
     path: '/api/mi-servicio/mi-endpoint',
     summary: 'Descripción del endpoint',
     tags: ['Mi Servicio'],
     request: {
       body: { content: { 'application/json': { schema: MiRequestSchema } } }
     },
     responses: {
       200: {
         description: 'OK',
         content: { 'application/json': { schema: MiResponseSchema } }
       }
     }
   });
   ```

4. **Regenera los contratos** desde la raíz del monorepo:
   ```bash
   pnpm run generate:contracts
   ```

---

## Cómo consumir en el Front-End

Los tipos generados te dan acceso a los contratos en tiempo de compilación. Ejemplo en el cliente web:

```typescript
import type { paths } from '@uniconnect/api-types';

// Tipo de la respuesta del endpoint POST /auth/login
type LoginResponse = paths['/auth/login']['post']['responses']['200']['content']['application/json'];

// Uso con fetch tipado
async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json() as Promise<LoginResponse>;
}
```

Los esquemas Zod también están disponibles para validación de formularios en el frontend:

```typescript
import { AuthSchemas } from '@uniconnect/api-types';

// Validar formulario de login antes de enviarlo al backend
const result = AuthSchemas.LoginRequestSchema.safeParse({ email, password });
if (!result.success) {
  console.error(result.error.issues);
}
```

---

## Prueba de Breaking Change (Safety Net)

Si un desarrollador backend cambia el contrato de un endpoint, el build del frontend fallará automáticamente:

1. Modifica un campo en el backend (ej. renombra `token` → `accessToken` en `AuthResponseSchema`).
2. Corre `pnpm run generate:contracts`.
3. Cualquier código frontend que use `response.token` lanzará un error de TypeScript.
4. Revertir el cambio o actualizar el frontend para adaptarse al nuevo contrato.

---

## Cómo hacer bump de versión API

1. Actualizar `version` en `packages/api-types/package.json` (seguir [SemVer](https://semver.org/lang/es/)).
2. Describir los cambios en `packages/api-types/CHANGELOG.md`.
3. Correr `pnpm run generate:contracts` para sincronizar todo.

---

## Scripts disponibles

| Comando (desde raíz) | Descripción |
|---|---|
| `pnpm run generate:spec` | Regenera `gateway/openapi.json` desde los schemas Zod |
| `pnpm run generate:types` | Convierte `openapi.json` en tipos TypeScript (`openapi.d.ts`) |
| `pnpm run generate:contracts` | Ejecuta ambos en secuencia |
| `pnpm --filter @uniconnect/gateway run dev` | Levanta el API Gateway con Swagger en `/docs` |

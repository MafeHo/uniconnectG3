# CHANGES

## [FIX] Presencia — estado no se actualiza en tiempo real en chat 1-a-1

**Fecha:** 2026-05-11

**Causa encontrada:** El backend emite `USER_STATUS_CHANGED` **solo a los rooms de grupos compartidos** (`io.to(gid).emit(...)`). En un chat 1-a-1, el usuario A no está en ningún room de grupo con B, así que el evento nunca llega al listener del frontend. El fallback `io.emit(...)` (broadcast global) solo ocurre si `getGroupsByUserId` lanza una excepción, no en condiciones normales.

**Fix aplicado:** Polling cada 5 segundos con `check_user_status` (callback/ack) mientras el chat está abierto. El listener `USER_STATUS_CHANGED` se mantiene como complemento para el caso en que el backend haga fallback broadcast.

**Archivos modificados:**
- `uniconnect_web/src/hooks/usePresence.ts`
- `uniconnect_g3/src/presentation/hooks/usePresence.ts`

**Nota:** La solución ideal sería que el backend emitiera `USER_STATUS_CHANGED` también al room `user_${userId}` (que ya existe), pero eso requiere modificar el backend. El polling de 5s es un workaround funcional con impacto mínimo (una consulta ligera por socket cada 5s solo mientras el chat está visible).

---



## [FIX] Presencia — "Desconectado" aunque usuario está activo

**Fecha:** 2026-05-11

**Causa encontrada:** Causa C + Causa A combinadas.
- **Causa C**: `SocketContext.tsx` usaba `useRef` para almacenar los sockets. El `Provider` renderizaba con `null` (valor inicial del ref), luego el `useEffect` creaba el socket y asignaba `ref.current`, pero sin causar re-render. Los consumidores de `useChatSocket()` nunca recibían el socket real, el `useEffect` de `useOtherPresence` salía por el guard `if (!chatSocket)` y nunca volvía a correr.
- **Causa A**: incluso con el socket disponible, `check_user_status` podía emitirse antes de que el socket terminara de conectar, perdiendo el callback.

**Fix aplicado:**
- `SocketContext.tsx`: `useRef` → `useState`. El socket se expone al estado solo en el evento `'connect'`, forzando re-render de todos los consumidores.
- `usePresence.ts` (web y mobile): `queryStatus` se ejecuta inmediatamente si `socket.connected`, o espera `once('connect')` si no.
- `useChatSocket.ts` (mobile): refactorizado con patrón pub/sub (`Set` de listeners) para notificar a todos los componentes que usan el hook cuando el socket singleton conecta/desconecta.

**Archivos modificados:**
- `uniconnect_web/src/context/SocketContext.tsx`
- `uniconnect_web/src/hooks/usePresence.ts`
- `uniconnect_g3/src/presentation/hooks/useChatSocket.ts`
- `uniconnect_g3/src/presentation/hooks/usePresence.ts`

---



## [REFACTOR] Presencia online — migración a WebSocket del backend

**Fecha:** 2026-05-11  
**Commit:** `feat(chat): presencia en tiempo real via WebSocket del chat-service`

**Archivos modificados:**
- `uniconnect_web/src/hooks/usePresence.ts`
- `uniconnect_web/src/context/SocketContext.tsx`
- `uniconnect_web/src/routes/chat/index.tsx`
- `uniconnect_g3/src/presentation/hooks/usePresence.ts`
- `uniconnect_g3/src/presentation/hooks/useChatSocket.ts` *(nuevo)*
- `uniconnect_g3/app/chat/[chatId].tsx`

### Antes

Presencia con Firestore: `setDoc` a `presence/{userId}` al conectar/desconectar.  
Dependía de `AppState` (mobile) y `visibilitychange` (web) para detectar cambios de estado.  
`useOtherPresence` usaba `onSnapshot` de Firestore para leer el estado del otro usuario.

### Después

Presencia con WebSocket del chat-service (puerto 3004):
- `check_user_status`: consulta inicial al montar el componente (callback/ack)
- `USER_STATUS_CHANGED`: actualizaciones en tiempo real
- El backend gestiona `activeUsers` Map automáticamente al conectar/desconectar el socket
- `useMyPresence` queda vacío: el backend registra presencia al recibir la conexión con `userId` en el handshake query

### Evento del backend (confirmado en `chat-service/index.js`)

- **Nombre:** `USER_STATUS_CHANGED`
- **Payload:** `{ userId: string, status: 'online' | 'offline' }`
- **Emisión:** segmentada a los grupos del usuario (con fallback a broadcast global si falla)
- **`check_user_status`** responde via callback/ack: `{ userId: string, status: 'online' | 'offline' }`

### Cambios en UI

- `lastSeen` eliminado de web (`chat/index.tsx`) y mobile (`chat/[chatId].tsx`)
- `formatLastSeen` y `formatRelativeTime` eliminados (ya no se usan)
- Estado simplificado a: `isOnline ? 'En línea' : 'Desconectado'`

### Nota sobre colección `presence` en Firestore

Los documentos en `presence/{userId}` que escribió la implementación anterior ya no se actualizan.  
No es necesario borrarlos manualmente; simplemente quedan obsoletos y no afectan el funcionamiento.

### Nota sobre mobile (useChatSocket)

Mobile no tenía socket al chat-service (3004). Se creó `useChatSocket.ts` como singleton,  
usando `EXPO_PUBLIC_CHAT_URL` o derivando el puerto 3004 desde `EXPO_PUBLIC_BACKEND_URL`.

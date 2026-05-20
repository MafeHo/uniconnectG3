# Guía de Pruebas Unitarias de Transición de Estados - Grupo de Estudio

Este directorio contiene los archivos de prueba para el microservicio `social-service`. Para guiar la lógica de pruebas de los casos de uso y la lógica de negocio de los grupos de estudio, se diseñó la siguiente matriz de transición de estados.

## Matriz de Transición de Estados

| ID Caso de Prueba | Estado Inicial | Acción / Evento Disparador | Estado Final Esperado | Comportamiento Esperado / Resultado | Tipo de Transición |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC-GROUP-001** | `N/A` (No existe) | Crear nuevo grupo (Validación exitosa) | `Activo` (o `Borrador`) | El grupo se persiste en BD con el estado inicial. Se retorna `201 Created`. | Válida |
| **UC-GROUP-002** | `Borrador` | Publicar/Activar grupo | `Activo` | El grupo actualiza su estado. Se emiten notificaciones a interesados. | Válida |
| **UC-GROUP-003** | `Activo` | Archivar grupo (Por el Administrador) | `Archivado` | El grupo cambia su estado y se bloquean nuevas interacciones/mensajes. | Válida |
| **UC-GROUP-004** | `Activo` | Eliminar grupo (Soft delete) | `Eliminado` | El grupo es marcado como eliminado. Ya no aparece en las búsquedas. | Válida |
| **UC-GROUP-005** | `Archivado` | Eliminar grupo (Soft delete) | `Eliminado` | El grupo archivado pasa a eliminado permanentemente para los usuarios. | Válida |
| **UC-GROUP-006** | `Borrador` | Eliminar grupo | `Eliminado` | El grupo en borrador se descarta. | Válida |
| **UC-GROUP-007** | `Archivado` | Desarchivar / Reactivar grupo | `Activo` | El grupo vuelve a estar disponible para interacción y membresía. | Válida |
| **UC-GROUP-008** | `Archivado` | Modificar detalles del grupo (Ej. Nombre, Descripción) | `Archivado` | Se lanza una excepción `InvalidStateException`. Un grupo archivado es de solo lectura. | Inválida (Negativa) |
| **UC-GROUP-009** | `Eliminado` | Reactivar/Activar grupo | `Eliminado` | Se lanza una excepción `GroupNotFoundException` o `InvalidTransitionException`. | Inválida (Negativa) |
| **UC-GROUP-010** | `Eliminado` | Archivar grupo | `Eliminado` | Se lanza una excepción `GroupNotFoundException` o `InvalidTransitionException`. | Inválida (Negativa) |
| **UC-GROUP-011** | `Borrador` | Archivar grupo | `Borrador` | Se lanza una excepción `InvalidTransitionException`. Un borrador no tiene historial para archivar. | Inválida (Negativa) |
| **UC-GROUP-012** | `Activo` | Activar grupo (Redundancia) | `Activo` | Se lanza una advertencia o se omite la acción idempotente sin fallos de BD. | Inválida/Idempotente |
| **UC-GROUP-013** | `Cualquiera` | Forzar estado no reconocido (Ej. `EN_PAUSA`) | Mismo estado inicial | El esquema Zod y el modelo de dominio rechazan el payload lanzando `ValidationError`. | Inválida (Negativa) |

---

## Reglas de Negocio Protegidas

1. **Inmutabilidad Relativa de Estados Terminales (`Eliminado`)**:
   Un grupo en estado `Eliminado` entra en un estado sumidero (sink state). Desde este estado no debe ser posible realizar ninguna otra transición (ni reactivar, ni archivar, ni editar).
   
2. **Garantía de Solo Lectura (`Archivado`)**:
   El estado `Archivado` protege la integridad del historial académico y de chat. Los casos negativos garantizan que el dominio lance la excepción adecuada cuando se intentan realizar operaciones de escritura.

3. **Restricción de Flujo Secuencial (`Borrador` -> `Activo` -> `Archivado`)**:
   Las pruebas garantizan la consistencia histórica previniendo transiciones ilógicas, como archivar un borrador que nunca tuvo actividad.

4. **Validación robusta del payload**:
   Cualquier intento de forzar estados no soportados es filtrado en la frontera por los esquemas de validación Zod y el dominio.

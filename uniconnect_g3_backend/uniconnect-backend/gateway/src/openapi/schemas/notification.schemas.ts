import { registry } from '../registry';
import { NotificationSchema } from '@uniconnect/api-types/dist/schemas/notification.schema';
import { z } from 'zod';

// Register models
const OpenAPINotification = registry.register('Notification', NotificationSchema);

const NotifyRequestSchema = registry.register('NotifyRequest', z.object({
  event: z.enum([
    'SOLICITUD_INGRESO',
    'SOLICITUD_ACEPTADA',
    'SOLICITUD_RECHAZADA',
    'TRANSFER_ADMIN',
    'TRANSFER_ADMIN_SOLICITADA',
    'TRANSFER_ADMIN_ACEPTADA',
    'TRANSFER_ADMIN_RECHAZADA',
    'MENCION',
    'NUEVO_EVENTO'
  ]),
  payload: z.record(z.string(), z.unknown())
}));

// Register paths
registry.registerPath({
  method: 'post',
  path: '/api/notifications/notify',
  summary: 'Emitir una notificación de evento',
  tags: ['Notificaciones'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: NotifyRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Notificación procesada y enviada',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/notifications/{userId}',
  summary: 'Obtener notificaciones de un usuario',
  tags: ['Notificaciones'],
  request: {
    params: z.object({
      userId: z.string().openapi({ description: 'ID de Firebase del usuario' })
    }),
    query: z.object({
      limit: z.coerce.number().optional().default(20).openapi({ description: 'Cantidad máxima de notificaciones a recuperar' })
    })
  },
  responses: {
    200: {
      description: 'Notificaciones recuperadas exitosamente',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: OpenAPINotification.array()
          })
        }
      }
    }
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/notifications/{userId}/unread-count',
  summary: 'Obtener cantidad de notificaciones no leídas',
  tags: ['Notificaciones'],
  request: {
    params: z.object({
      userId: z.string().openapi({ description: 'ID de Firebase del usuario' })
    })
  },
  responses: {
    200: {
      description: 'Cantidad de notificaciones no leídas recuperada',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            unreadCount: z.number()
          })
        }
      }
    }
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/notifications/{id}/read',
  summary: 'Marcar una notificación como leída',
  tags: ['Notificaciones'],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'ID de la notificación' })
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            userId: z.string().openapi({ description: 'ID del usuario para validar permisos' })
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Notificación marcada como leída exitosamente',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/notifications/user/{userId}/read-all',
  summary: 'Marcar todas las notificaciones de un usuario como leídas',
  tags: ['Notificaciones'],
  request: {
    params: z.object({
      userId: z.string().openapi({ description: 'ID de Firebase del usuario' })
    })
  },
  responses: {
    200: {
      description: 'Todas las notificaciones marcadas como leídas',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean()
          })
        }
      }
    }
  },
});

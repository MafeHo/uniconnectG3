import { registry } from '../registry';
import { z } from 'zod';
import {
  CreateGroupRequestSchema,
  JoinGroupRequestSchema,
  HandleJoinRequestSchema,
  TransferAdminRequestSchema,
  AdminTransferResponseSchema,
  CreateEventRequestSchema,
  SubscribeCategoryRequestSchema,
  GroupSchema,
  EventSchema,
  CategorySchema,
  RequestAdminTransferSchema,
  AddMemberRequestSchema,
  SearchGroupsQuerySchema,
  UnsubscribeCategoryQuerySchema
} from '@uniconnect/api-types/dist/schemas/social.schema';

// Register models
const OpenAPIGroup = registry.register('Group', GroupSchema);
const OpenAPIEvent = registry.register('Event', EventSchema);
const OpenAPICategory = registry.register('Category', CategorySchema);

const OpenAPICreateGroupRequest = registry.register('CreateGroupRequest', CreateGroupRequestSchema);
const OpenAPIJoinGroupRequest = registry.register('JoinGroupRequest', JoinGroupRequestSchema);
const OpenAPIHandleJoinRequest = registry.register('HandleJoinRequest', HandleJoinRequestSchema);
const OpenAPITransferAdminRequest = registry.register('TransferAdminRequest', TransferAdminRequestSchema);
const OpenAPIAdminTransferResponse = registry.register('AdminTransferResponse', AdminTransferResponseSchema);
const OpenAPICreateEventRequest = registry.register('CreateEventRequest', CreateEventRequestSchema);
const OpenAPISubscribeCategoryRequest = registry.register('SubscribeCategoryRequest', SubscribeCategoryRequestSchema);
const OpenAPIRequestAdminTransfer = registry.register('RequestAdminTransfer', RequestAdminTransferSchema);
const OpenAPIAddMemberRequest = registry.register('AddMemberRequest', AddMemberRequestSchema);

// === GROUPS PATHS ===

// Create a new group
registry.registerPath({
  method: 'post',
  path: '/api/groups',
  summary: 'Crear un nuevo grupo de estudio',
  tags: ['Social - Grupos'],
  request: {
    body: {
      content: {
        'application/json': { schema: OpenAPICreateGroupRequest }
      }
    }
  },
  responses: {
    201: {
      description: 'Grupo creado',
      content: { 'application/json': { schema: OpenAPIGroup } }
    }
  }
});

// Check if a group name is unique
registry.registerPath({
  method: 'get',
  path: '/api/groups/check-name/{name}',
  summary: 'Verificar si el nombre de grupo está disponible',
  tags: ['Social - Grupos'],
  request: {
    params: z.object({
      name: z.string().openapi({ description: 'Nombre del grupo a verificar' })
    })
  },
  responses: {
    200: {
      description: 'Disponibilidad devuelta',
      content: {
        'application/json': {
          schema: z.object({ isUnique: z.boolean() })
        }
      }
    }
  }
});

// Get user groups
registry.registerPath({
  method: 'get',
  path: '/api/groups/user/{userId}',
  summary: 'Obtener los grupos de estudio de un usuario',
  tags: ['Social - Grupos'],
  request: {
    params: z.object({
      userId: z.string().openapi({ description: 'ID de Firebase del usuario' })
    }),
    query: z.object({
      role: z.string().optional().openapi({ description: 'Filtrar por rol: admin o member' })
    })
  },
  responses: {
    200: {
      description: 'Grupos devueltos con éxito',
      content: {
        'application/json': { schema: OpenAPIGroup.array() }
      }
    }
  }
});

// Search groups with filters
registry.registerPath({
  method: 'get',
  path: '/api/groups',
  summary: 'Buscar grupos con filtros',
  tags: ['Social - Grupos'],
  request: {
    query: SearchGroupsQuerySchema.extend({
      userSubjectIds: z.string().optional().openapi({ description: 'Lista de IDs de asignaturas del usuario separadas por comas' }),
      userId: z.string().optional().openapi({ description: 'ID de Firebase del usuario que busca' })
    })
  },
  responses: {
    200: {
      description: 'Búsqueda exitosa',
      content: {
        'application/json': { schema: OpenAPIGroup.array() }
      }
    }
  }
});

// Get group by ID
registry.registerPath({
  method: 'get',
  path: '/api/groups/{id}',
  summary: 'Obtener detalles de un grupo por ID',
  tags: ['Social - Grupos'],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'ID del grupo' })
    }),
    query: z.object({
      userId: z.string().optional().openapi({ description: 'ID de Firebase del usuario para verificar si es miembro' })
    })
  },
  responses: {
    200: {
      description: 'Detalles del grupo',
      content: {
        'application/json': { schema: OpenAPIGroup }
      }
    },
    404: {
      description: 'Grupo no encontrado'
    }
  }
});

// Send join request to group
registry.registerPath({
  method: 'post',
  path: '/api/groups/{id}/requests',
  summary: 'Enviar solicitud de unión al grupo',
  tags: ['Social - Grupos'],
  request: {
    params: z.object({ id: z.string().openapi({ description: 'ID del grupo' }) }),
    body: {
      content: { 'application/json': { schema: OpenAPIJoinGroupRequest } }
    }
  },
  responses: {
    200: { description: 'Solicitud enviada exitosamente' }
  }
});

// Get group requests
registry.registerPath({
  method: 'get',
  path: '/api/groups/{id}/requests',
  summary: 'Obtener solicitudes pendientes de ingreso a un grupo',
  tags: ['Social - Grupos'],
  request: {
    params: z.object({ id: z.string().openapi({ description: 'ID del grupo' }) })
  },
  responses: {
    200: {
      description: 'Lista de solicitudes',
      content: {
        'application/json': {
          schema: z.array(z.any())
        }
      }
    }
  }
});

// Handle join request (accept/reject)
registry.registerPath({
  method: 'put',
  path: '/api/groups/{id}/requests/{requestId}',
  summary: 'Aceptar o rechazar una solicitud de ingreso',
  tags: ['Social - Grupos'],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'ID del grupo' }),
      requestId: z.string().openapi({ description: 'ID de la solicitud' })
    }),
    body: {
      content: { 'application/json': { schema: OpenAPIHandleJoinRequest } }
    }
  },
  responses: {
    200: { description: 'Acción procesada con éxito' }
  }
});

// Delete user join request
registry.registerPath({
  method: 'delete',
  path: '/api/groups/{id}/requests/{userId}',
  summary: 'Eliminar solicitud de unión de un usuario',
  tags: ['Social - Grupos'],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'ID del grupo' }),
      userId: z.string().openapi({ description: 'ID de Firebase del usuario' })
    })
  },
  responses: {
    200: { description: 'Solicitud eliminada' }
  }
});

// Add member directly
registry.registerPath({
  method: 'post',
  path: '/api/groups/{id}/members',
  summary: 'Agregar miembro directamente a un grupo',
  tags: ['Social - Grupos'],
  request: {
    params: z.object({ id: z.string().openapi({ description: 'ID del grupo' }) }),
    body: {
      content: { 'application/json': { schema: OpenAPIAddMemberRequest } }
    }
  },
  responses: {
    201: { description: 'Miembro agregado exitosamente' }
  }
});

// Remove member
registry.registerPath({
  method: 'delete',
  path: '/api/groups/{id}/members/{userId}',
  summary: 'Eliminar un miembro de un grupo',
  tags: ['Social - Grupos'],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'ID del grupo' }),
      userId: z.string().openapi({ description: 'ID de Firebase del miembro a eliminar' })
    }),
    query: z.object({
      adminId: z.string().openapi({ description: 'ID de Firebase del administrador que realiza la acción' })
    })
  },
  responses: {
    200: { description: 'Miembro eliminado con éxito' }
  }
});

// Leave group
registry.registerPath({
  method: 'delete',
  path: '/api/groups/{id}/leave/{userId}',
  summary: 'Salir voluntariamente de un grupo de estudio',
  tags: ['Social - Grupos'],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'ID del grupo' }),
      userId: z.string().openapi({ description: 'ID de Firebase del usuario' })
    })
  },
  responses: {
    200: { description: 'Salida exitosa' }
  }
});

// Transfer admin directly
registry.registerPath({
  method: 'put',
  path: '/api/groups/{id}/transfer-admin',
  summary: 'Ceder administración de forma directa',
  tags: ['Social - Grupos'],
  request: {
    params: z.object({ id: z.string().openapi({ description: 'ID del grupo' }) }),
    body: {
      content: { 'application/json': { schema: OpenAPITransferAdminRequest } }
    }
  },
  responses: {
    200: { description: 'Administración cedida' }
  }
});

// Request admin transfer
registry.registerPath({
  method: 'post',
  path: '/api/groups/{id}/transfer-admin/request',
  summary: 'Solicitar transferencia de administración a un miembro',
  tags: ['Social - Grupos'],
  request: {
    params: z.object({ id: z.string().openapi({ description: 'ID del grupo' }) }),
    body: {
      content: { 'application/json': { schema: OpenAPIRequestAdminTransfer } }
    }
  },
  responses: {
    200: { description: 'Solicitud de transferencia enviada exitosamente' }
  }
});

// Respond to admin transfer response
registry.registerPath({
  method: 'post',
  path: '/api/groups/{id}/transfer-admin/response',
  summary: 'Aceptar o rechazar solicitud de transferencia de administración',
  tags: ['Social - Grupos'],
  request: {
    params: z.object({ id: z.string().openapi({ description: 'ID del grupo' }) }),
    body: {
      content: { 'application/json': { schema: OpenAPIAdminTransferResponse } }
    }
  },
  responses: {
    200: { description: 'Respuesta procesada' }
  }
});

// Get available students for group
registry.registerPath({
  method: 'get',
  path: '/api/groups/{groupId}/available-students',
  summary: 'Obtener estudiantes disponibles para agregar al grupo',
  tags: ['Social - Grupos'],
  request: {
    params: z.object({
      groupId: z.string().openapi({ description: 'ID del grupo' })
    })
  },
  responses: {
    200: {
      description: 'Estudiantes disponibles recuperados',
      content: {
        'application/json': {
          schema: z.array(z.any())
        }
      }
    }
  }
});

// === EVENTS PATHS ===

// Get events
registry.registerPath({
  method: 'get',
  path: '/api/events',
  summary: 'Obtener lista de eventos universitarios',
  tags: ['Social - Eventos'],
  request: {
    query: z.object({
      category: z.string().optional().openapi({ description: 'Filtrar por ID de categoría' })
    })
  },
  responses: {
    200: {
      description: 'Lista de eventos',
      content: { 'application/json': { schema: OpenAPIEvent.array() } }
    }
  }
});

// Create event
registry.registerPath({
  method: 'post',
  path: '/api/events',
  summary: 'Crear un nuevo evento universitario',
  tags: ['Social - Eventos'],
  request: {
    body: {
      content: { 'application/json': { schema: OpenAPICreateEventRequest } }
    }
  },
  responses: {
    201: {
      description: 'Evento creado',
      content: { 'application/json': { schema: OpenAPIEvent } }
    }
  }
});

// Get categories
registry.registerPath({
  method: 'get',
  path: '/api/events/categories',
  summary: 'Obtener todas las categorías de eventos',
  tags: ['Social - Eventos'],
  responses: {
    200: {
      description: 'Categorías devueltas',
      content: { 'application/json': { schema: OpenAPICategory.array() } }
    }
  }
});

// Subscribe to category
registry.registerPath({
  method: 'post',
  path: '/api/events/suscribir',
  summary: 'Suscribirse a una categoría de eventos',
  tags: ['Social - Eventos'],
  request: {
    body: {
      content: { 'application/json': { schema: OpenAPISubscribeCategoryRequest } }
    }
  },
  responses: {
    201: { description: 'Suscripción exitosa' },
    409: { description: 'Suscripción duplicada' }
  }
});

// Unsubscribe from category
registry.registerPath({
  method: 'delete',
  path: '/api/events/suscribir',
  summary: 'Cancelar suscripción a una categoría',
  tags: ['Social - Eventos'],
  request: {
    query: UnsubscribeCategoryQuerySchema
  },
  responses: {
    204: { description: 'Cancelación exitosa' }
  }
});

// Get subscribed categories
registry.registerPath({
  method: 'get',
  path: '/api/events/suscripciones/{userId}',
  summary: 'Obtener las categorías suscritas de un estudiante',
  tags: ['Social - Eventos'],
  request: {
    params: z.object({
      userId: z.string().openapi({ description: 'ID de Firebase del usuario' })
    })
  },
  responses: {
    200: {
      description: 'Lista de suscripciones',
      content: {
        'application/json': {
          schema: z.array(z.any())
        }
      }
    }
  }
});

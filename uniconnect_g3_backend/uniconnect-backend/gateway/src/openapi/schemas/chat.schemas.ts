import { registry } from '../registry';
import { z } from 'zod';
import {
  MessageSchema,
  SendMessageRequestSchema,
  CreateChatRequestSchema,
  CreateChatResponseSchema,
  AddReactionRequestSchema,
  ChatSchema,
  SuccessResponseSchema
} from '@uniconnect/api-types/dist/schemas/chat.schema';

// Register models
const OpenAPIMessage = registry.register('Message', MessageSchema);
const OpenAPISendMessageRequest = registry.register('SendMessageRequest', SendMessageRequestSchema);
const OpenAPICreateChatRequest = registry.register('CreateChatRequest', CreateChatRequestSchema);
const OpenAPICreateChatResponse = registry.register('CreateChatResponse', CreateChatResponseSchema);
const OpenAPIAddReactionRequest = registry.register('AddReactionRequest', AddReactionRequestSchema);
const OpenAPIChat = registry.register('Chat', ChatSchema);
const OpenAPISuccessResponse = registry.register('ChatSuccessResponse', SuccessResponseSchema);

// === PRIVATE & GENERAL CHATS ===

registry.registerPath({
  method: 'post',
  path: '/api/chats',
  summary: 'Crear un nuevo chat privado o grupal',
  tags: ['Chats'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: OpenAPICreateChatRequest,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Chat creado exitosamente',
      content: {
        'application/json': {
          schema: OpenAPICreateChatResponse,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/chats/{chatId}/messages',
  summary: 'Enviar mensaje de texto a un chat',
  tags: ['Mensajería'],
  request: {
    params: z.object({
      chatId: z.string().openapi({ description: 'ID del chat o grupo' })
    }),
    body: {
      content: {
        'application/json': {
          schema: OpenAPISendMessageRequest,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Mensaje enviado exitosamente',
      content: {
        'application/json': {
          schema: OpenAPIMessage,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/chats/{chatId}/messages',
  summary: 'Obtener historial de mensajes de un chat',
  tags: ['Mensajería'],
  request: {
    params: z.object({
      chatId: z.string().openapi({ description: 'ID del chat o grupo' })
    }),
    query: z.object({
      limit: z.coerce.number().optional().default(50).openapi({ description: 'Cantidad de mensajes a recuperar' }),
      before: z.string().optional().openapi({ description: 'Timestamp o ID para paginación hacia atrás' })
    })
  },
  responses: {
    200: {
      description: 'Historial de mensajes recuperado exitosamente',
      content: {
        'application/json': {
          schema: MessageSchema.array(),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/chats/{chatId}/files',
  summary: 'Enviar un archivo/imagen a un chat',
  tags: ['Mensajería'],
  request: {
    params: z.object({
      chatId: z.string().openapi({ description: 'ID del chat' })
    }),
    body: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              file: {
                type: 'string',
                format: 'binary',
                description: 'Archivo a subir (imagen, PDF, etc)'
              }
            },
            required: ['file']
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Archivo subido y mensaje creado',
      content: {
        'application/json': {
          schema: OpenAPIMessage,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/chats/{chatId}/messages/{messageId}/reactions',
  summary: 'Agregar reacción a un mensaje',
  tags: ['Mensajería'],
  request: {
    params: z.object({
      chatId: z.string().openapi({ description: 'ID del chat' }),
      messageId: z.string().openapi({ description: 'ID del mensaje' })
    }),
    body: {
      content: {
        'application/json': {
          schema: OpenAPIAddReactionRequest,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Reacción agregada exitosamente',
      content: {
        'application/json': {
          schema: OpenAPISuccessResponse,
        },
      },
    },
  },
});

// === GROUP CHATS (Legacy/Specific Endpoints) ===

registry.registerPath({
  method: 'post',
  path: '/api/group-chats/{groupId}/messages',
  summary: 'Enviar mensaje de texto a un chat grupal',
  tags: ['Chats de Grupo'],
  request: {
    params: z.object({
      groupId: z.string().openapi({ description: 'ID del grupo de estudio' })
    }),
    body: {
      content: {
        'application/json': {
          schema: OpenAPISendMessageRequest,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Mensaje enviado exitosamente',
      content: {
        'application/json': {
          schema: OpenAPIMessage,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/group-chats/{groupId}/files',
  summary: 'Enviar un archivo/imagen a un chat grupal',
  tags: ['Chats de Grupo'],
  request: {
    params: z.object({
      groupId: z.string().openapi({ description: 'ID del grupo de estudio' })
    }),
    body: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              file: {
                type: 'string',
                format: 'binary',
                description: 'Archivo a subir (imagen, PDF, etc)'
              }
            },
            required: ['file']
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Archivo subido y mensaje creado',
      content: {
        'application/json': {
          schema: OpenAPIMessage,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/group-chats/{groupId}/messages/{messageId}/reactions',
  summary: 'Agregar reacción a un mensaje de chat grupal',
  tags: ['Chats de Grupo'],
  request: {
    params: z.object({
      groupId: z.string().openapi({ description: 'ID del grupo' }),
      messageId: z.string().openapi({ description: 'ID del mensaje' })
    }),
    body: {
      content: {
        'application/json': {
          schema: OpenAPIAddReactionRequest,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Reacción agregada exitosamente',
      content: {
        'application/json': {
          schema: OpenAPISuccessResponse,
        },
      },
    },
  },
});

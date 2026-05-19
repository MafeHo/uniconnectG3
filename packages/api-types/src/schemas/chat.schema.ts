import { z } from 'zod';

export const MessageTypeSchema = z.enum(['text', 'image', 'file', 'system']);

export const MessageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  senderId: z.string(),
  content: z.string(),
  type: MessageTypeSchema,
  fileURL: z.string().optional().nullable(),
  fileName: z.string().optional().nullable(),
  fileSize: z.number().optional().nullable(),
  createdAt: z.union([z.date(), z.string()]),
  readBy: z.array(z.string()).optional(),
  reactions: z.record(z.string(), z.array(z.string())).optional(),
});

export const SendMessageRequestSchema = z.object({
  content: z.string().min(1, 'El mensaje no puede estar vacío'),
  type: MessageTypeSchema.default('text'),
  fileURL: z.string().optional().nullable(),
  fileName: z.string().optional().nullable(),
  fileSize: z.number().optional().nullable(),
});

export const CreateChatRequestSchema = z.object({
  participants: z.array(z.string()).min(2, 'Debe haber al menos 2 participantes'),
});

export const AddReactionRequestSchema = z.object({
  reaction: z.string().min(1, 'La reacción no puede estar vacía'),
});

export const ChatSchema = z.object({
  id: z.string(),
  participants: z.array(z.string()),
  lastMessage: z.string().optional(),
  updatedAt: z.union([z.date(), z.string()]),
});

export const CreateChatResponseSchema = z.object({
  success: z.boolean(),
  chat: ChatSchema,
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

// Request and parameter validation schemas
export const SendChatMessageRequestSchema = z.object({
  senderId: z.string().min(1, 'El senderId es requerido'),
  content: z.string().min(1, 'El mensaje no puede estar vacío'),
  type: MessageTypeSchema.default('text'),
  fileURL: z.string().optional().nullable(),
  fileName: z.string().optional().nullable(),
  fileSize: z.number().optional().nullable(),
});

export const AddChatReactionRequestSchema = z.object({
  userId: z.string().min(1, 'El userId es requerido'),
  reaction: z.string().min(1, 'La reacción no puede estar vacía'),
});

export const ChatIdParamSchema = z.object({
  chatId: z.string().min(1, 'El chatId es requerido'),
});

export const SendGroupMessageRequestSchema = z.object({
  senderId: z.string().min(1, 'El senderId es requerido'),
  content: z.string().min(1, 'El mensaje no puede estar vacío'),
  type: MessageTypeSchema.default('text'),
  fileURL: z.string().optional().nullable(),
  fileName: z.string().optional().nullable(),
  fileSize: z.number().optional().nullable(),
});

export const GroupReactionRequestSchema = z.object({
  userId: z.string().min(1, 'El userId es requerido'),
  reaction: z.string().min(1, 'La reacción no puede estar vacía'),
});

export const GroupChatParamsSchema = z.object({
  groupId: z.string().min(1, 'El groupId es requerido'),
});

export const GroupMessageParamsSchema = z.object({
  groupId: z.string().min(1, 'El groupId es requerido'),
  messageId: z.string().min(1, 'El messageId es requerido'),
});

export const ChatMessageParamsSchema = z.object({
  chatId: z.string().min(1, 'El chatId es requerido'),
  messageId: z.string().min(1, 'El messageId es requerido'),
});



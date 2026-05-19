import { z } from 'zod';

export const NotificationSchema = z.object({
  userId: z.string().min(1, 'El userId es requerido'),
  title: z.string().min(1, 'El título es requerido'),
  body: z.string().min(1, 'El cuerpo es requerido'),
  metadata: z.record(z.string(), z.unknown()).default({}),
  type: z.string().min(1, 'El tipo es requerido'), // 'chat', 'group', 'event'
  eventType: z.string().default('GENERAL'), // 'MESSAGE', 'GRADE', 'ALERT'
  action: z.object({
    label: z.string(),
    endpoint: z.string(),
    token: z.string().nullable().optional()
  }).optional(),
  createdAt: z.union([z.date(), z.string()]).optional()
});

export type NotificationInputDTO = z.infer<typeof NotificationSchema>;

// Request and parameter validation schemas
export const NotifyRequestSchema = z.object({
  event: z.string().min(1, 'El event es requerido'),
  payload: z.record(z.string(), z.unknown())
});

export const MarkReadRequestSchema = z.object({
  authUserId: z.string().min(1, 'El authUserId/userId es requerido')
});


import { z } from 'zod';
import { registry } from '../registry';

export const ErrorResponseSchema = registry.register('ErrorResponse', z.object({
  error: z.string().openapi({ example: 'Ocurrió un error genérico' })
}));

export const Error400Schema = registry.register('Error400', z.object({
  error: z.string().openapi({ example: 'Solicitud incorrecta o parámetros inválidos' })
}));

export const Error401Schema = registry.register('Error401', z.object({
  error: z.string().openapi({ example: 'No autorizado - Token inválido o ausente' })
}));

export const Error404Schema = registry.register('Error404', z.object({
  error: z.string().openapi({ example: 'Recurso no encontrado' })
}));

export const Error500Schema = registry.register('Error500', z.object({
  error: z.string().openapi({ example: 'Ocurrió un error en el servidor interno' })
}));

export const SuccessResponseSchema = registry.register('SuccessResponse', z.object({
  success: z.boolean().openapi({ example: true })
}));

export const PaginationSchema = registry.register('Pagination', z.object({
  page: z.number().int().min(1).openapi({ example: 1 }),
  limit: z.number().int().min(1).max(100).openapi({ example: 20 }),
  totalCount: z.number().int().min(0).openapi({ example: 150 }),
  totalPages: z.number().int().min(0).openapi({ example: 8 }),
  hasNextPage: z.boolean().openapi({ example: true }),
  hasPrevPage: z.boolean().openapi({ example: false })
}));

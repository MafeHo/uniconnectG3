import { registry } from '../registry';
import { z } from 'zod';
import {
  UserSchema,
  UpsertProfileRequestSchema,
  SearchStudentsResponseSchema,
  AcademicProfileSchema,
  EstadisticasSchema
} from '@uniconnect/api-types/dist/schemas/user.schema';

// Register models
const OpenAPIUser = registry.register('UserProfile', UserSchema);
const OpenAPIAcademicProfile = registry.register('AcademicProfile', AcademicProfileSchema);
const OpenAPIEstadisticas = registry.register('Estadisticas', EstadisticasSchema);
const OpenAPIUpsertProfileRequest = registry.register('UpsertProfileRequest', UpsertProfileRequestSchema);
const OpenAPISearchStudentsResponse = registry.register('SearchStudentsResponse', SearchStudentsResponseSchema);

// Register paths
registry.registerPath({
  method: 'get',
  path: '/api/users/profile/{studentId}',
  summary: 'Obtener perfil del estudiante',
  tags: ['Perfiles'],
  request: {
    params: z.object({
      studentId: z.string().openapi({ description: 'ID de Firebase del estudiante' })
    })
  },
  responses: {
    200: {
      description: 'Perfil recuperado exitosamente',
      content: {
        'application/json': {
          schema: OpenAPIUser,
        },
      },
    },
    404: {
      description: 'Perfil de estudiante no encontrado',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/users/profile/estadisticas/{studentId}',
  summary: 'Obtener perfil decorado con estadísticas del estudiante',
  tags: ['Perfiles'],
  request: {
    params: z.object({
      studentId: z.string().openapi({ description: 'ID de Firebase del estudiante' })
    })
  },
  responses: {
    200: {
      description: 'Perfil decorado recuperado exitosamente',
      content: {
        'application/json': {
          schema: OpenAPIUser,
        },
      },
    },
    404: {
      description: 'Estudiante no encontrado',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/users/profile',
  summary: 'Crear o actualizar perfil del estudiante',
  tags: ['Perfiles'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: OpenAPIUpsertProfileRequest,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Perfil actualizado exitosamente',
      content: {
        'application/json': {
          schema: OpenAPIUser,
        },
      },
    },
    201: {
      description: 'Perfil creado exitosamente',
      content: {
        'application/json': {
          schema: OpenAPIUser,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/users/search',
  summary: 'Buscar estudiantes con filtros',
  tags: ['Búsqueda'],
  request: {
    query: z.object({
      query: z.string().optional().openapi({ description: 'Búsqueda por nombre o correo' }),
      career: z.string().optional().openapi({ description: 'ID de la carrera para filtrar' }),
      semester: z.coerce.number().optional().openapi({ description: 'Semestre para filtrar' }),
      page: z.coerce.number().optional().default(1).openapi({ description: 'Número de página' }),
      limit: z.coerce.number().optional().default(20).openapi({ description: 'Límite de resultados' })
    })
  },
  responses: {
    200: {
      description: 'Resultados de búsqueda recuperados exitosamente',
      content: {
        'application/json': {
          schema: OpenAPISearchStudentsResponse,
        },
      },
    },
  },
});

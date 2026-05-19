import { registry } from '../registry';
import { z } from 'zod';
import {
  FacultySchema,
  CareerSchema,
  SubjectSchema,
  AcademicLevelSchema,
  FormationLevelSchema,
  AcademicMappingSchema
} from '@uniconnect/api-types/dist/schemas/academic.schema';

// Register models
const OpenAPIFaculty = registry.register('Faculty', FacultySchema);
const OpenAPICareer = registry.register('Career', CareerSchema);
const OpenAPISubject = registry.register('Subject', SubjectSchema);
const OpenAPIAcademicLevel = registry.register('AcademicLevel', AcademicLevelSchema);
const OpenAPIFormationLevel = registry.register('FormationLevel', FormationLevelSchema);

// Register paths
registry.registerPath({
  method: 'get',
  path: '/api/hierarchy/faculties',
  summary: 'Obtener todas las facultades',
  tags: ['Académico'],
  responses: {
    200: {
      description: 'Facultades recuperadas exitosamente',
      content: {
        'application/json': {
          schema: OpenAPIFaculty.array(),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/hierarchy/academic-levels/{facultyId}',
  summary: 'Obtener niveles académicos por facultad',
  tags: ['Académico'],
  request: {
    params: z.object({
      facultyId: z.string().openapi({ description: 'ID de la facultad' })
    })
  },
  responses: {
    200: {
      description: 'Niveles académicos recuperados',
      content: {
        'application/json': {
          schema: OpenAPIAcademicLevel.array(),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/hierarchy/formation-levels/{facultyId}/{academicLevelId}',
  summary: 'Obtener niveles de formación por facultad y nivel académico',
  tags: ['Académico'],
  request: {
    params: z.object({
      facultyId: z.string().openapi({ description: 'ID de la facultad' }),
      academicLevelId: z.string().openapi({ description: 'ID del nivel académico' })
    })
  },
  responses: {
    200: {
      description: 'Niveles de formación recuperados',
      content: {
        'application/json': {
          schema: OpenAPIFormationLevel.array(),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/hierarchy/careers-by-path/{facultyId}/{academicLevelId}/{formationLevelId}',
  summary: 'Obtener carreras según ruta académica',
  tags: ['Académico'],
  request: {
    params: z.object({
      facultyId: z.string().openapi({ description: 'ID de la facultad' }),
      academicLevelId: z.string().openapi({ description: 'ID del nivel académico' }),
      formationLevelId: z.string().openapi({ description: 'ID del nivel de formación' })
    })
  },
  responses: {
    200: {
      description: 'Carreras recuperadas',
      content: {
        'application/json': {
          schema: OpenAPICareer.array(),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/careers/careers',
  summary: 'Obtener lista de todas las carreras',
  tags: ['Académico'],
  responses: {
    200: {
      description: 'Lista completa de carreras recuperada',
      content: {
        'application/json': {
          schema: OpenAPICareer.array(),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/subjects/subjects',
  summary: 'Obtener lista de todas las asignaturas',
  tags: ['Académico'],
  responses: {
    200: {
      description: 'Lista de asignaturas recuperada',
      content: {
        'application/json': {
          schema: OpenAPISubject.array(),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/career-structure/{careerId}',
  summary: 'Obtener la estructura académica de una carrera',
  tags: ['Académico'],
  request: {
    params: z.object({
      careerId: z.string().openapi({ description: 'ID de la carrera' })
    })
  },
  responses: {
    200: {
      description: 'Estructura académica recuperada',
    },
  },
});

import { z } from 'zod';

export const AcademicProfileSchema = z.object({
  studentId: z.string(),
  mappingId: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
});

export const EstadisticasSchema = z.object({
  gruposCreados: z.number().default(0),
  gruposParticipa: z.number().default(0),
  mensajesEnviados: z.number().default(0),
});

export const UserSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string().email(),
  photoURL: z.string().url().optional(),
  lastLogin: z.union([z.date(), z.string()]).optional(),
  biography: z.string().optional(),
  showEmail: z.boolean().optional(),
  phone: z.string().optional(),
  age: z.union([z.number(), z.string()]).optional(),
  studyPreference: z.string().optional(),
  interests: z.array(z.string()).optional(),
  careerId: z.string().optional(),
  careerName: z.string().optional(),
  facultyId: z.string().optional(),
  facultyName: z.string().optional(),
  academicLevelId: z.string().optional(),
  academicLevelName: z.string().optional(),
  formationLevelId: z.string().optional(),
  formationLevelName: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  subjectNames: z.array(z.string()).optional(),
  mappingId: z.string().optional(),
  estadisticas: EstadisticasSchema.optional(),
  insignias: z.array(z.string()).optional(),
});

export const UpsertProfileRequestSchema = z.object({
  uid: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  biography: z.string().max(500).optional(),
  phone: z.string().optional(),
  showEmail: z.boolean().optional(),
  age: z.union([z.number(), z.string()]).optional(),
  studyPreference: z.string().optional(),
  interests: z.array(z.string()).optional(),
  careerId: z.string().optional(),
  careerName: z.string().optional(),
  facultyId: z.string().optional(),
  facultyName: z.string().optional(),
  academicLevelId: z.string().optional(),
  academicLevelName: z.string().optional(),
  formationLevelId: z.string().optional(),
  formationLevelName: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  subjectNames: z.array(z.string()).optional(),
  mappingId: z.string().optional(),
});

export const SearchStudentsResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

// Request and route parameter validation schemas
export const SaveAcademicProfileRequestSchema = z.object({
  studentId: z.string().min(1, 'studentId es requerido'),
  subjects: z.array(z.string()).min(1, 'Debe registrar al menos una materia'),
  careerId: z.string().min(1, 'careerId es requerido'),
});

export const StudentIdParamSchema = z.object({
  studentId: z.string().min(1, 'studentId es requerido')
});

export const GetDecoratedProfileQuerySchema = z.object({
  vista: z.string().optional()
});

export const SearchStudentsQuerySchema = z.object({
  query: z.string().optional(),
  name: z.string().optional(),
  subjectId: z.string().optional(),
  excludeId: z.string().optional(),
});

export const UserIdParamSchema = z.object({
  userId: z.string().min(1, 'El userId es requerido')
});



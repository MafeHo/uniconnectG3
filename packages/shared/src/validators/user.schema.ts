import { z } from 'zod';

export const EstadisticasSchema = z.object({
  gruposCreados: z.number(),
  gruposParticipa: z.number(),
  mensajesEnviados: z.number(),
});

export const AcademicInfoSchema = z.object({
  career: z.string(),
  semester: z.number().int().min(1).max(10),
  faculty: z.string().optional(),
  enrollmentYear: z.number().int().optional(),
});

export const SocialStatsSchema = z.object({
  groupsCount: z.number().int().min(0),
  eventsCount: z.number().int().min(0),
  connectionsCount: z.number().int().min(0),
});

// User validation schemas
export const UserSchema = z.object({
  // Auth service
  uid: z.string(),
  name: z.string(),
  displayName: z.string().min(2).max(100).optional(),
  email: z.string().email(),
  photoURL: z.string().url().optional(),
  lastLogin: z.date().or(z.any()).optional(),

  // User service
  biography: z.string().optional(),
  showEmail: z.boolean().optional(),
  phone: z.string().optional(),
  age: z.union([z.number(), z.string()]).optional(),
  studyPreference: z.string().optional(),
  interests: z.array(z.string()).optional(),

  // Academic profile
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
  
  // Decorated profile
  estadisticas: EstadisticasSchema.optional(),
  insignias: z.array(z.string()).optional(),

  // UI only
  id: z.string().optional(), // alias for uid
  createdAt: z.date().or(z.any()).optional(),
  updatedAt: z.date().or(z.any()).optional(),
});

export const UserProfileSchema = UserSchema.extend({
  academicInfo: AcademicInfoSchema.optional(),
  socialStats: SocialStatsSchema.optional(),
});

export const UserSearchSchema = z.object({
  query: z.string().min(1).max(100).optional(),
  career: z.string().optional(),
  semester: z.number().int().min(1).max(10).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const UpdateUserProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  displayName: z.string().min(2).max(100).optional(),
  photoURL: z.string().url().optional(),
  biography: z.string().max(500).optional(),
  phone: z.string().optional(),
  showEmail: z.boolean().optional(),
  age: z.union([z.number(), z.string()]).optional(),
  studyPreference: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

// Type inference exports
export type User = z.infer<typeof UserSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Estadisticas = z.infer<typeof EstadisticasSchema>;
export type AcademicInfo = z.infer<typeof AcademicInfoSchema>;
export type SocialStats = z.infer<typeof SocialStatsSchema>;

export type UserInput = z.infer<typeof UserSchema>;
export type UserProfileInput = z.infer<typeof UserProfileSchema>;
export type UserSearchInput = z.infer<typeof UserSearchSchema>;
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;

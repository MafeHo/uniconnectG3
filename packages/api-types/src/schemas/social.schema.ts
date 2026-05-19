import { z } from 'zod';

export const CreateGroupRequestSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  subjectId: z.string().optional(),
  subjectName: z.string().optional(),
  isPrivate: z.boolean().default(false),
  maxMembers: z.number().int().min(2).max(100).default(50),
  adminId: z.string(),
  rules: z.string().max(1000).optional()
});

export const JoinGroupRequestSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  message: z.string().max(300).optional()
});

export const HandleJoinRequestSchema = z.object({
  status: z.enum(['ACEPTADA', 'RECHAZADA'])
});

export const TransferAdminRequestSchema = z.object({
  adminId: z.string(),
  newAdminId: z.string()
});

export const AdminTransferResponseSchema = z.object({
  status: z.enum(['ACEPTADA', 'RECHAZADA'])
});

export const CreateEventRequestSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().max(1000),
  date: z.string(), // ISO date string
  location: z.string(),
  organizerId: z.string(),
  categoryId: z.string()
});

export const SubscribeCategoryRequestSchema = z.object({
  userId: z.string(),
  categoryId: z.string()
});

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  subjectId: z.string().optional(),
  subjectName: z.string().optional(),
  isPrivate: z.boolean(),
  maxMembers: z.number(),
  adminId: z.string(),
  membersCount: z.number(),
  createdAt: z.string().optional()
});

export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.string(),
  location: z.string(),
  organizerId: z.string(),
  categoryId: z.string(),
  createdAt: z.string().optional()
});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional()
});

// Request, query, and parameter validation schemas
export const RequestAdminTransferSchema = z.object({
  adminId: z.string().min(1, 'El adminId es requerido'),
  candidateId: z.string().min(1, 'El candidateId es requerido'),
});

export const AddMemberRequestSchema = z.object({
  userId: z.string().min(1, 'El userId es requerido'),
  userName: z.string().min(1, 'El userName es requerido'),
});

export const SearchGroupsQuerySchema = z.object({
  query: z.string().optional(),
  subjectId: z.string().optional(),
});

export const UnsubscribeCategoryQuerySchema = z.object({
  userId: z.string().min(1, 'El userId es requerido'),
  categoryId: z.string().min(1, 'El categoryId es requerido'),
});


import { z } from 'zod';

export const GroupRoleSchema = z.enum(['admin', 'student', 'moderator', 'member']);

export const GroupMemberSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  groupId: z.string().optional(),
  role: GroupRoleSchema,
  joinedAt: z.any().optional(), // Date or any in manual type
});

export const GroupCategorySchema = z.enum([
  'academic',
  'social',
  'sports',
  'cultural',
  'professional',
  'other',
]);

export const GroupPrivacySchema = z.enum(['public', 'private']);

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  imageURL: z.string().url().optional(),
  category: GroupCategorySchema.optional(),
  privacy: GroupPrivacySchema.optional(),
  subjectId: z.string(),
  creatorId: z.string(),
  createdAt: z.date().or(z.any()),
  updatedAt: z.date().or(z.any()),
  
  // Extended fields
  subjectName: z.string().optional(),
  memberCount: z.number().optional(),
  members: z.array(GroupMemberSchema).optional(),
});

export const CreateGroupSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  subjectId: z.string(),
  creatorId: z.string(),
  imageURL: z.string().url().optional(),
  category: GroupCategorySchema.optional(),
  privacy: GroupPrivacySchema.optional(),
});

export const UpdateGroupSchema = CreateGroupSchema.partial();

export const GroupSearchSchema = z.object({
  query: z.string().optional(),
  subjectId: z.string().optional(),
  category: GroupCategorySchema.optional(),
  privacy: GroupPrivacySchema.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Type inference
export type Group = z.infer<typeof GroupSchema>;
export type GroupMember = z.infer<typeof GroupMemberSchema>;
export type GroupInput = z.infer<typeof GroupSchema>;
export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
export type UpdateGroupInput = z.infer<typeof UpdateGroupSchema>;
export type GroupSearchInput = z.infer<typeof GroupSearchSchema>;

import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  career: z.string().optional(),
  semester: z.number().min(1).max(10).optional(),
});

export const UserSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string().email(),
  lastLogin: z.union([z.date(), z.string()]).optional(),
  biography: z.string().optional(),
  showEmail: z.boolean().optional(),
  phone: z.string().optional(),
  age: z.union([z.number(), z.string()]).optional(),
  studyPreference: z.string().optional(),
});

export const AuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
});

export const LogoutResponseSchema = z.object({
  message: z.string(),
});

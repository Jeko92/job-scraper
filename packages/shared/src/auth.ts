import { z } from 'zod';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface AuthUser {
  id: string;
  username: string;
}

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
}

export function createRegisterRequestSchema(
  passwordMinLength: number,
): z.ZodType<RegisterRequest> {
  return z.object({
    firstName: z.string().trim().nonempty(),
    lastName: z.string().trim().nonempty(),
    username: z.string().trim().nonempty(),
    password: z.string().min(passwordMinLength),
  });
}

export const loginRequestSchema: z.ZodType<LoginRequest> = z.object({
  username: z.string().trim().nonempty(),
  password: z.string().nonempty(),
});

export const loginResponseSchema: z.ZodType<LoginResponse> = z.object({
  access_token: z.string().nonempty(),
});

export const authUserSchema: z.ZodType<AuthUser> = z.object({
  id: z.uuid(),
  username: z.string(),
});

export const publicUserSchema: z.ZodType<PublicUser> = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
});

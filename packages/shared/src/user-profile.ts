import { z } from 'zod';

import { type Location, locationSchema } from './locations';

export const REMOTE_PREFERENCES = ['REMOTE', 'HYBRID', 'ONSITE'] as const;
export type RemotePreference = (typeof REMOTE_PREFERENCES)[number];
export const remotePreferenceSchema: z.ZodType<RemotePreference> =
  z.enum(REMOTE_PREFERENCES);

export const EMPLOYMENT_TYPES = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
  'FREELANCE',
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export const employmentTypeSchema: z.ZodType<EmploymentType> =
  z.enum(EMPLOYMENT_TYPES);

export const SKILL_LEVELS = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];
export const skillLevelSchema: z.ZodType<SkillLevel> = z.enum(SKILL_LEVELS);

export const MAX_PROFILE_SKILLS = 50;
export const MAX_PROFILE_INDUSTRIES = 10;

// numeric(4,1) and numeric(12,2) in the database.
const yearsExperienceSchema = z.number().min(0).max(99.9).multipleOf(0.1);
const salarySchema = z.number().min(0).max(9_999_999_999.99).multipleOf(0.01);

// --- Response -------------------------------------------------------------

export interface UserProfileSkill {
  id: string;
  name: string;
  slug: string;
  level: SkillLevel | null;
  yearsExperience: number | null;
}

export interface UserProfileIndustry {
  id: string;
  name: string;
  slug: string;
  /** 1 = most important. */
  priority: number | null;
}

export interface UserPreferences {
  remotePreference: RemotePreference | null;
  employmentType: EmploymentType | null;
  minSalary: number | null;
  salaryCurrency: string | null;
  willingToRelocate: boolean;
}

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  headline: string | null;
  yearsExperience: number | null;
  location: Location | null;
  /** Ordered by name. */
  skills: UserProfileSkill[];
  /** Ordered by priority. */
  industries: UserProfileIndustry[];
  /** null until preferences are first saved. */
  preferences: UserPreferences | null;
  updatedAt: string;
}

export const userProfileSchema: z.ZodType<UserProfile> = z.object({
  id: z.uuid(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  headline: z.string().nullable(),
  yearsExperience: z.number().nullable(),
  location: locationSchema.nullable(),
  skills: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      slug: z.string(),
      level: skillLevelSchema.nullable(),
      yearsExperience: z.number().nullable(),
    }),
  ),
  industries: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      slug: z.string(),
      priority: z.number().int().nullable(),
    }),
  ),
  preferences: z
    .object({
      remotePreference: remotePreferenceSchema.nullable(),
      employmentType: employmentTypeSchema.nullable(),
      minSalary: z.number().nullable(),
      salaryCurrency: z.string().nullable(),
      willingToRelocate: z.boolean(),
    })
    .nullable(),
  updatedAt: z.iso.datetime(),
});

// --- Update request -------------------------------------------------------

/**
 * Every field is optional: an omitted field stays unchanged, `null` clears a
 * nullable one. `skills` and `industries` replace the whole list; the order of
 * `industries` sets their priority.
 */
export interface UpdateUserProfileRequest {
  firstName?: string | undefined;
  lastName?: string | undefined;
  headline?: string | null | undefined;
  yearsExperience?: number | null | undefined;
  locationId?: string | null | undefined;
  skills?:
    | {
        slug: string;
        level?: SkillLevel | null | undefined;
        yearsExperience?: number | null | undefined;
      }[]
    | undefined;
  /** Industry slugs, most important first. */
  industries?: string[] | undefined;
  preferences?:
    | {
        remotePreference?: RemotePreference | null | undefined;
        employmentType?: EmploymentType | null | undefined;
        minSalary?: number | null | undefined;
        salaryCurrency?: string | null | undefined;
        willingToRelocate?: boolean | undefined;
      }
    | undefined;
}

function hasUniqueValues(values: string[]): boolean {
  return new Set(values).size === values.length;
}

export const updateUserProfileSchema: z.ZodType<UpdateUserProfileRequest> =
  z.object({
    firstName: z.string().trim().nonempty().max(100).optional(),
    lastName: z.string().trim().nonempty().max(100).optional(),
    headline: z.string().trim().max(200).nullable().optional(),
    yearsExperience: yearsExperienceSchema.nullable().optional(),
    locationId: z.uuid().nullable().optional(),
    skills: z
      .array(
        z.object({
          slug: z.string().trim().nonempty(),
          level: skillLevelSchema.nullable().optional(),
          yearsExperience: yearsExperienceSchema.nullable().optional(),
        }),
      )
      .max(MAX_PROFILE_SKILLS)
      .refine((skills) => hasUniqueValues(skills.map((s) => s.slug)), {
        message: 'Skill slugs must be unique',
      })
      .optional(),
    industries: z
      .array(z.string().trim().nonempty())
      .max(MAX_PROFILE_INDUSTRIES)
      .refine(hasUniqueValues, { message: 'Industry slugs must be unique' })
      .optional(),
    preferences: z
      .object({
        remotePreference: remotePreferenceSchema.nullable().optional(),
        employmentType: employmentTypeSchema.nullable().optional(),
        minSalary: salarySchema.nullable().optional(),
        salaryCurrency: z
          .string()
          .regex(/^[A-Z]{3}$/, 'Use a 3-letter ISO 4217 code, e.g. EUR')
          .nullable()
          .optional(),
        willingToRelocate: z.boolean().optional(),
      })
      .optional(),
  });

import { z } from 'zod';

import {
  type CreateJobRequest,
  jobFieldsSchema,
  salaryRangeIsValid,
} from './create-job.dto.js';

type JobFields = Omit<CreateJobRequest, 'companyId'>;

export type UpdateJobRequest = {
  [K in keyof JobFields]?: JobFields[K] | undefined;
} & {
  isActive?: boolean | undefined;
};

export const updateJobSchema: z.ZodType<UpdateJobRequest> = jobFieldsSchema
  .omit({ companyId: true })
  .partial()
  .extend({ isActive: z.boolean().optional() })
  .refine(salaryRangeIsValid, {
    message: 'salaryMin must not be greater than salaryMax',
    path: ['salaryMin'],
  });

import type { ValueTransformer } from 'typeorm';

/** pg returns `numeric` columns as strings; expose them as numbers. */
export const decimalTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

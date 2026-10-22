import type { Company } from '../entities/company.entity.js';

/**
 * DTO for company responses: the company's columns without relations.
 */
export type CompanyDto = Omit<Company, 'locations' | 'skills' | 'industries'>;

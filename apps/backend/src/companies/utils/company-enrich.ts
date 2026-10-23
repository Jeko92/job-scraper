import type { CompanySearchParams } from '../providers/company-data-provider.js';
import type {
  CompanyEmployees,
  CompanySearchPageInput,
} from '../providers/company-enrich.provider.js';

/**
 * Map CompanySearchParams to CompanySearchPageInput for the API.
 */
export function mapSearchParamsToRequestBody(
  params: CompanySearchParams,
): CompanySearchPageInput {
  const body: CompanySearchPageInput = {};

  // Map query
  if (params.query) {
    body.query = params.query;
  }

  // Map pagination: convert offset/limit to page/pageSize
  // page is 1-indexed, so page = (offset / limit) + 1
  if (params.limit) {
    body.pageSize = params.limit;
  }
  if (params.limit) {
    body.page = Math.floor(params.offset / params.limit) + 1;
  } else {
    body.page = params.offset + 1;
  }

  // Map location to countries (assuming location is country code for now)
  if (params.location) {
    body.countries = [params.location];
  }

  // Map industry
  if (params.industry) {
    body.industries = [params.industry];
  }

  // Map employee range filters
  if (params.minEmployees || params.maxEmployees) {
    body.employees = mapEmployeeRangeToApiFilter(
      params.minEmployees,
      params.maxEmployees,
    );
  }

  // Map founded year range
  if (params.foundedAfter !== undefined || params.foundedBefore !== undefined) {
    body.foundedYear = {
      min: params.foundedAfter ?? null,
      max: params.foundedBefore ?? null,
    };
  }

  return body;
}

/**
 * Map min/max employee counts to the API's employee range enum.
 * This is a simplified mapping - the API uses predefined ranges.
 */
function mapEmployeeRangeToApiFilter(
  minEmployees?: number,
  maxEmployees?: number,
): CompanyEmployees[] | null {
  if (!minEmployees && !maxEmployees) {
    return null;
  }

  const ranges: CompanyEmployees[] = [];
  const min = minEmployees ?? 0;
  const max = maxEmployees ?? Infinity;

  // Map based on ranges
  if (min <= 10 && max >= 1) ranges.push('1-10');
  if (min <= 50 && max >= 11) ranges.push('11-50');
  if (min <= 200 && max >= 51) ranges.push('51-200');
  if (min <= 500 && max >= 201) ranges.push('201-500');
  if (min <= 1000 && max >= 501) ranges.push('501-1K');
  if (min <= 5000 && max >= 1001) ranges.push('1K-5K');
  if (min <= 10000 && max >= 5001) ranges.push('5K-10K');
  if (max >= 10001) ranges.push('over-10K');

  return ranges.length > 0 ? ranges : null;
}

/**
 * Estimate employee count from the API's range enum.
 * Returns the midpoint of the range for approximate counting.
 */
export function estimateEmployeesFromRange(range: CompanyEmployees): number {
  const rangeMap: Record<CompanyEmployees, number> = {
    '1-10': 5,
    '11-50': 30,
    '51-200': 125,
    '201-500': 350,
    '501-1K': 750,
    '1K-5K': 3000,
    '5K-10K': 7500,
    'over-10K': 15000,
  };
  return rangeMap[range];
}

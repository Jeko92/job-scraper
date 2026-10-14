import { z } from 'zod';

const DOMAIN_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

const text = z.string().trim().min(1);

export const normalizedLocationSchema = z.object({
  countryCode: text.nullable(),
  countryName: text.nullable(),
  stateName: text.nullable(),
  city: text.nullable(),
  postalCode: text.nullable(),
});

export const normalizedCompanySchema = z.object({
  source: text,
  externalId: text,
  name: text,
  legalName: text.nullable(),
  domain: z.string().regex(DOMAIN_PATTERN),
  websiteUrl: z.url().nullable(),
  companyType: text.nullable(),
  description: text.nullable(),
  numberOfEmployees: z.number().int().nonnegative().nullable(),
  employeeRange: text.nullable(),
  foundingYear: z.number().int().nullable(),
  locations: z.array(normalizedLocationSchema),
  industries: z.array(text),
  skills: z.array(text),
});

export type NormalizedLocation = z.infer<typeof normalizedLocationSchema>;
export type NormalizedCompany = z.infer<typeof normalizedCompanySchema>;
export type CompanyCandidate = Omit<NormalizedCompany, 'domain'> & {
  domain: string | null;
};

export function textOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed === '' ? null : trimmed;
}

export function toDomain(value: string | null | undefined): string | null {
  const url = textOrNull(value);
  if (url === null) {
    return null;
  }
  try {
    const { hostname } = new URL(url.includes('://') ? url : `https://${url}`);
    return hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function toSlug(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replaceAll('+', '-plus')
    .replaceAll('#', 'sharp')
    .replace(/\.net\b/g, '-dotnet')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function dedupeByDomain(
  companies: NormalizedCompany[],
): NormalizedCompany[] {
  const byDomain = new Map<string, NormalizedCompany>();
  for (const company of companies) {
    const kept = byDomain.get(company.domain);
    byDomain.set(company.domain, kept ? fillMissing(kept, company) : company);
  }
  return [...byDomain.values()];
}

function fillMissing(
  kept: NormalizedCompany,
  other: NormalizedCompany,
): NormalizedCompany {
  return {
    ...kept,
    legalName: kept.legalName ?? other.legalName,
    websiteUrl: kept.websiteUrl ?? other.websiteUrl,
    companyType: kept.companyType ?? other.companyType,
    description: kept.description ?? other.description,
    numberOfEmployees: kept.numberOfEmployees ?? other.numberOfEmployees,
    employeeRange: kept.employeeRange ?? other.employeeRange,
    foundingYear: kept.foundingYear ?? other.foundingYear,
    locations: [...kept.locations, ...other.locations],
    industries: [...new Set([...kept.industries, ...other.industries])],
    skills: [...new Set([...kept.skills, ...other.skills])],
  };
}

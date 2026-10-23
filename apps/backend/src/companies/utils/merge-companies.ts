import type { NormalizedCompany } from '../providers/company-data-provider.js';

/**
 * Merge results from multiple providers and deduplicate by domain/website.
 */
export function mergeAndDeduplicate(
  companies: NormalizedCompany[],
): NormalizedCompany[] {
  const seen = new Map<string, NormalizedCompany>();

  for (const company of companies) {
    // Use domain as the primary key for deduplication
    const key = company.domain ?? company.websiteUrl ?? company.name;

    if (!key) {
      continue;
    }

    const existing = seen.get(key.toLowerCase());

    if (!existing) {
      // First time seeing this company
      seen.set(key.toLowerCase(), company);
    } else {
      // Merge: prefer non-null values from the new company
      const merged: NormalizedCompany = {
        ...existing,
        name: company.name ?? existing.name,
        legalName: company.legalName ?? existing.legalName,
        websiteUrl: company.websiteUrl ?? existing.websiteUrl,
        companyType: company.companyType ?? existing.companyType,
        description: company.description ?? existing.description,
        numberOfEmployees:
          company.numberOfEmployees ?? existing.numberOfEmployees,
        employeeRange: company.employeeRange ?? existing.employeeRange,
        foundingYear: company.foundingYear ?? existing.foundingYear,
        // Prefer the first source for tracking
        source: existing.source,
        externalId: existing.externalId,
        rawData: company.rawData,
      };
      seen.set(key.toLowerCase(), merged);
    }
  }

  return Array.from(seen.values());
}

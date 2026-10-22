import type { CompanySearchParams } from '../providers/company-data-provider.js';
import type {
  WikidataCompany,
  WikidataResponse,
} from '../providers/wikidata.provider.js';

/**
 * Projection and optional attributes shared by all company queries.
 * Multi-valued properties are aggregated so each company yields one row.
 */
const COMPANY_SELECT = `
  SELECT ?company ?companyLabel
    (SAMPLE(?w) AS ?website) (MIN(?f) AS ?founded) (MAX(?e) AS ?employees)
    (SAMPLE(?h) AS ?hq) (SAMPLE(?hl) AS ?hqLabel)
    (SAMPLE(?i) AS ?industry) (SAMPLE(?il) AS ?industryLabel)
`;

const COMPANY_OPTIONAL_ATTRIBUTES = `
  OPTIONAL { ?company wdt:P856 ?w. }
  OPTIONAL { ?company wdt:P571 ?f. }
  OPTIONAL { ?company wdt:P1128 ?e. }
  OPTIONAL { ?company wdt:P159 ?h. ?h rdfs:label ?hl. FILTER(LANG(?hl) = "de") }
  OPTIONAL { ?company wdt:P452 ?i. ?i rdfs:label ?il. FILTER(LANG(?il) = "de") }
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "de,en".
    ?company rdfs:label ?companyLabel.
  }
`;

/**
 * Build SPARQL query based on search parameters.
 */
export function buildSparqlQuery(params: CompanySearchParams): string {
  const { query, location, industry, limit, offset } = params;

  // Base query for German IT companies
  let whereClause = `
    # Match either country = Germany OR headquarters located in Germany
    { ?company wdt:P17 wd:Q183. }
    UNION
    { ?company wdt:P159/wdt:P17 wd:Q183. }

    # Subclasses of IT (software development, cloud computing, cybersecurity, etc.)
    ?company wdt:P452/wdt:P279* wd:Q11661.
  `;

  // Filters match against rdfs:label directly, because variables bound by
  // the label service are not yet available when FILTERs are evaluated.
  if (query !== undefined) {
    whereClause += `
      ?company rdfs:label ?nameFilter.
      FILTER(LANG(?nameFilter) IN ("de", "en") && ${containsIgnoreCase('?nameFilter', query)})
    `;
  }

  if (location !== undefined) {
    whereClause += `
      ?company wdt:P159 ?hqFilter. ?hqFilter rdfs:label ?hqFilterLabel.
      FILTER(LANG(?hqFilterLabel) IN ("de", "en") && ${containsIgnoreCase('?hqFilterLabel', location)})
    `;
  }

  if (industry !== undefined) {
    whereClause += `
      ?company wdt:P452 ?industryFilter. ?industryFilter rdfs:label ?industryFilterLabel.
      FILTER(LANG(?industryFilterLabel) IN ("de", "en") && ${containsIgnoreCase('?industryFilterLabel', industry)})
    `;
  }

  return `
    ${COMPANY_SELECT}
    WHERE {
      ${whereClause}
      ${COMPANY_OPTIONAL_ATTRIBUTES}
    }
    GROUP BY ?company ?companyLabel
    ORDER BY ?companyLabel
    LIMIT ${String(limit)} OFFSET ${String(offset)}
  `;
}

/**
 * Build SPARQL query for a single company by name.
 * Uses the Wikidata entity search API, as a regex over all labels times out.
 */
export function buildSingleCompanyQuery(identifier: string): string {
  return `
    ${COMPANY_SELECT}
    WHERE {
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:endpoint "www.wikidata.org";
                        wikibase:api "EntitySearch";
                        mwapi:search "${escapeSparqlString(identifier)}";
                        mwapi:language "de".
        ?company wikibase:apiOutputItem mwapi:item.
        ?ordinal wikibase:apiOrdinal true.
      }

      # Restrict to instances of business (or subclasses)
      ?company wdt:P31/wdt:P279* wd:Q4830453.
      ${COMPANY_OPTIONAL_ATTRIBUTES}
    }
    GROUP BY ?company ?companyLabel ?ordinal
    ORDER BY ?ordinal
    LIMIT 1
  `;
}

/**
 * Parse Wikidata SPARQL results into company objects.
 */
export function parseWikidataResults(
  data: WikidataResponse,
): WikidataCompany[] {
  const companies: WikidataCompany[] = [];

  for (const binding of data.results.bindings) {
    const company: WikidataCompany = {
      company: binding['company']?.value ?? '',
      companyLabel: binding['companyLabel']?.value ?? '',
      website: binding['website']?.value,
      founded: binding['founded']?.value,
      employees: binding['employees']?.value,
      hq: binding['hq']?.value,
      hqLabel: binding['hqLabel']?.value,
      industry: binding['industry']?.value,
      industryLabel: binding['industryLabel']?.value,
    };
    companies.push(company);
  }

  return companies;
}

/**
 * Build a case-insensitive substring match expression.
 * Uses CONTAINS instead of REGEX so user input is not treated as a pattern.
 */
function containsIgnoreCase(variable: string, value: string): string {
  return `CONTAINS(LCASE(${variable}), LCASE("${escapeSparqlString(value)}"))`;
}

/**
 * Escape special characters in SPARQL string literals.
 */
function escapeSparqlString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

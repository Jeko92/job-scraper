/** Builds an ILIKE pattern matching `term` anywhere, with wildcards escaped. */
export function containsPattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, '\\$&')}%`;
}

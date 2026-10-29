export function domainFromUrl(url: string): string | null {
  return URL.parse(url)?.hostname.replace(/^www\./, '') ?? null;
}

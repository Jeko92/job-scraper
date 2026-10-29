/** Resolves `href` against `baseUrl`; only http(s) URLs, without `#hash`. */
export function absoluteUrl(href: string, baseUrl: string): string | null {
  try {
    const url = new URL(href, baseUrl);
    url.hash = '';
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/** Matches URLs on the website's domain or its subdomains. */
export function sameSite(websiteUrl: string): (url: string) => boolean {
  const site = hostOf(websiteUrl);
  return (url) => {
    const host = hostOf(url);
    return host !== '' && (host === site || host.endsWith(`.${site}`));
  };
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

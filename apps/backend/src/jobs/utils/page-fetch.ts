import { BadGatewayException } from '@nestjs/common';

import { absoluteUrl } from './url.js';

/** Page text sent to the model is cut off here to bound input tokens. */
const CRAWL_MAX_PAGE_LENGTH = 60_000;
const CRAWL_MAX_SITEMAP_URLS = 500;
const CRAWL_FETCH_TIMEOUT_MS = 15_000;

async function fetchPage(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(CRAWL_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`${String(response.status)} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    throw new BadGatewayException(`Could not load "${url}"`, {
      cause: error,
    });
  }
}

/** Loads a page as plain text; links stay visible as `label [url]`. */
export async function fetchPageText(url: string): Promise<string> {
  const html = await fetchPage(url);
  return html
    .replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(
      /<a\b[^>]*?\bhref=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_, href: string, label: string) => {
        const link = absoluteUrl(href, url);
        return link ? ` ${label} [${link}] ` : ` ${label} `;
      },
    )
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, CRAWL_MAX_PAGE_LENGTH);
}

/** URLs from `/sitemap.xml`; empty when the website has none. */
export async function fetchSitemapUrls(websiteUrl: string): Promise<string[]> {
  const xml = await fetchPage(new URL('/sitemap.xml', websiteUrl).href).catch(
    () => '',
  );
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .flatMap((match) => (match[1] ? [match[1]] : []))
    .slice(0, CRAWL_MAX_SITEMAP_URLS);
}

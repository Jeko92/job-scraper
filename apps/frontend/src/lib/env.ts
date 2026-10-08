const DEFAULT_BACKEND_URL = 'http://localhost:3030';

export function getBackendUrl(): string {
  const value = process.env['BACKEND_URL'];
  return value === undefined || value === '' ? DEFAULT_BACKEND_URL : value;
}

export function getThemeCookieMaxAge(): number | undefined {
  const value = Number(process.env['THEME_COOKIE_MAX_AGE']);
  return Number.isInteger(value) && value > 0 ? value : undefined;
}

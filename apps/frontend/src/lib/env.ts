const DEFAULT_BACKEND_URL = 'http://localhost:3030';

export function getBackendUrl(): string {
  const value = process.env['BACKEND_URL'];
  return value === undefined || value === '' ? DEFAULT_BACKEND_URL : value;
}

export function getThemeCookieMaxAge(): number | undefined {
  return getPositiveInteger('THEME_COOKIE_MAX_AGE');
}

export function getAuthCookieMaxAge(): number | undefined {
  return getPositiveInteger('AUTH_COOKIE_MAX_AGE');
}

export function getPasswordMinLength(): number | undefined {
  return getPositiveInteger('PASSWORD_MIN_LENGTH');
}

export function getHomeJobsLimit(): number | undefined {
  return getPositiveInteger('HOME_JOBS_LIMIT');
}

export function getHomeSavedJobsLimit(): number | undefined {
  return getPositiveInteger('HOME_SAVED_JOBS_LIMIT');
}

function getPositiveInteger(name: string): number | undefined {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : undefined;
}

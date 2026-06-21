const configuredAppBaseUrl =
  process.env.NEXT_PUBLIC_APP_BASE_URL?.trim().replace(/\/$/, "") ?? "";

export function getPublicAppBaseUrl() {
  if (configuredAppBaseUrl) {
    return configuredAppBaseUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

export function buildPublicAppUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getPublicAppBaseUrl();

  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

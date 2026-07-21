/**
 * Parse allowed frontend origins for CORS.
 * FRONTEND_ORIGIN supports comma-separated values (production + local dev).
 */
export function getAllowedOrigins(): string[] {
  const raw = process.env.FRONTEND_ORIGIN?.trim();
  if (raw) {
    return raw
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
  }

  if (process.env.NODE_ENV === "production") {
    return [];
  }

  return ["http://localhost:5173", "http://127.0.0.1:5173"];
}

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  const allowed = getAllowedOrigins();
  if (allowed.length === 0) return false;
  return allowed.includes(origin);
}

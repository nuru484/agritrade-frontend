/**
 * Typed access to the public env vars — mirrors the backend `ENV` pattern so
 * config is discoverable in one place and never read via bare `process.env`
 * scattered around the app.
 *
 * `SERVER_URI` is optional BY DESIGN here: while the dedicated backend doesn't
 * exist yet, an empty origin makes the api-slice hit this app's own
 * `/api/v1/*` route handlers (the stand-in office). Point it at the real API
 * origin when that ships and nothing else changes.
 */
export const env = {
  /** Origin of the Nasara Agro API. Empty = same-origin `/api/v1` stubs. */
  SERVER_URI: (process.env.NEXT_PUBLIC_SERVER_URI ?? "").replace(/\/$/, ""),
  /** Canonical site origin, used for metadata/links. */
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? "",
} as const;

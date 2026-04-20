/**
 * Image generation — same-origin `/api/generate-image` (Vite dev middleware or Vercel).
 * Override: `VITE_IMAGE_API=https://example.com/...` for a custom backend.
 */
export function resolveImageApiUrl(): string {
  const env = import.meta.env.VITE_IMAGE_API as string | undefined
  if (env?.trim()) return env.trim()
  return '/api/generate-image'
}

import { IMAGE_API_PUBLIC } from './constants'

/**
 * Image generation endpoint — mirrors Python:
 * requests.post(url, json={"prompt": "..."}) -> data["imageUrl"]
 *
 * Dev: Vite proxy avoids browser CORS.
 * Prod (Vercel): same-origin `/api/generate-image` forwards to the service.
 * Local `vite preview`: direct URL (no proxy) — set `VITE_IMAGE_API` if CORS blocks.
 * Override anytime: `VITE_IMAGE_API=https://image-z.created.app/api/generate-image`
 */
export function resolveImageApiUrl(): string {
  const env = import.meta.env.VITE_IMAGE_API as string | undefined
  if (env?.trim()) return env.trim()
  if (import.meta.env.DEV) return '/api/image/generate-image'
  if (typeof window !== 'undefined') {
    const h = window.location.hostname
    if (h === 'localhost' || h === '127.0.0.1') return IMAGE_API_PUBLIC
  }
  return '/api/generate-image'
}

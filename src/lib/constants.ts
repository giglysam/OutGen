export const GUEST_GENERATION_LIMIT = 5

/** Same-origin proxy in dev (Vite) and prod (Vercel) — forwards to chat-z. */
export const CHAT_API_PATH = '/api/chat'

/** Appended to every image positivePrompt for stronger fidelity (Simple Generator). */
export const IMAGE_PROMPT_QUALITY_SUFFIX =
  'masterpiece, ultra sharp focus, intricate fabric weave and stitching, accurate typography if any text, cinematic studio lighting, 8k fashion campaign, color graded, no watermark'

export const STORAGE_USER = 'outgen_user_v1'
export const STORAGE_GUEST_GENS = 'outgen_guest_generations_v1'

export type PlanId = 'classic' | 'premium' | 'enterprise'

export const PLAN_LABELS: Record<PlanId, string> = {
  classic: 'Classic',
  premium: 'Recommended',
  enterprise: 'Enterprise',
}

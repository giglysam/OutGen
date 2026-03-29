export const GUEST_GENERATION_LIMIT = 5

/** Direct URL if you need it outside the browser client */
export const IMAGE_API_PUBLIC = 'https://image-z.created.app/api/generate-image'
export const CHAT_API = 'https://chat-z.created.app/api/chat'

export const STORAGE_USER = 'outgen_user_v1'
export const STORAGE_GUEST_GENS = 'outgen_guest_generations_v1'

export type PlanId = 'classic' | 'premium' | 'enterprise'

export const PLAN_LABELS: Record<PlanId, string> = {
  classic: 'Classic',
  premium: 'Recommended',
  enterprise: 'Enterprise',
}

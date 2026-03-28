import { GUEST_GENERATION_LIMIT, STORAGE_GUEST_GENS } from './constants'

export function getGuestGenerationCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_GUEST_GENS)
    const n = raw ? parseInt(raw, 10) : 0
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

export function incrementGuestGenerationCount(): number {
  const next = getGuestGenerationCount() + 1
  try {
    localStorage.setItem(STORAGE_GUEST_GENS, String(next))
  } catch {
    /* ignore */
  }
  return next
}

export function guestCanGenerate(): boolean {
  return getGuestGenerationCount() < GUEST_GENERATION_LIMIT
}

export { GUEST_GENERATION_LIMIT }

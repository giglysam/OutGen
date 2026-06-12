const STORAGE_KEY = 'outgen_device_id'

function randomId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `d-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/** Stable per-browser device id for signup limits */
export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing) return existing
    const id = randomId()
    localStorage.setItem(STORAGE_KEY, id)
    return id
  } catch {
    return randomId()
  }
}

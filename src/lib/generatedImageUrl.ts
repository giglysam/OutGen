import type { GeneratedViews, ViewAngle } from '../types'

export function revokeGeneratedUrl(url: string | undefined | null) {
  if (url?.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url)
    } catch {
      /* ignore */
    }
  }
}

/** When replacing generated URLs, revoke previous blob: URLs to avoid leaks. */
export function mergeGeneratedViews(
  prev: GeneratedViews,
  patch: Partial<GeneratedViews>,
): GeneratedViews {
  for (const k of Object.keys(patch) as ViewAngle[]) {
    const next = patch[k]
    const old = prev[k]
    if (old && old !== next) revokeGeneratedUrl(old)
  }
  return { ...prev, ...patch }
}

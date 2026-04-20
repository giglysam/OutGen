import { CHAT_API, IMAGE_PROMPT_QUALITY_SUFFIX } from './constants'
import { resolveImageApiUrl } from './imageApiUrl'

/** Accept URLs, data URLs, blob URLs, or raw base64 payloads from JSON fields */
function pickImageString(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  if (!s) return null
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  if (s.startsWith('data:image/')) return s
  if (s.startsWith('blob:')) return s
  // Raw base64 (no data: prefix)
  if (s.length > 80 && /^[A-Za-z0-9+/=\s]+$/.test(s)) {
    const clean = s.replace(/\s/g, '')
    return `data:image/png;base64,${clean}`
  }
  return null
}

function extractImageReference(data: unknown): string {
  if (data == null) throw new Error('Réponse image vide.')

  if (typeof data === 'string') {
    const p = pickImageString(data)
    if (p) return p
    throw new Error('Réponse texte non reconnue comme image.')
  }

  if (typeof data !== 'object') {
    throw new Error('Réponse image invalide.')
  }

  const o = data as Record<string, unknown>

  const tryKeys = (obj: Record<string, unknown>): string | null =>
    pickImageString(obj.imageUrl) ??
    pickImageString(obj.image_url) ??
    pickImageString(obj.url) ??
    pickImageString(obj.image) ??
    pickImageString(obj.imageBase64) ??
    pickImageString(obj.base64) ??
    pickImageString(obj.data) ??
    pickImageString(obj.b64)

  let url = tryKeys(o)

  const nested = o.data
  if (!url && nested && typeof nested === 'object') url = tryKeys(nested as Record<string, unknown>)

  const result = o.result
  if (!url && result && typeof result === 'object') url = tryKeys(result as Record<string, unknown>)

  if (url) return url

  const debug = JSON.stringify(data).slice(0, 320)
  throw new Error(`Réponse sans image exploitable. Extrait : ${debug}`)
}

/**
 * Same intent as Python:
 * `requests.post(..., json={"prompt": "..."})` then read URL / base64 / or binary image body.
 */
function withQualitySuffix(prompt: string): string {
  const t = prompt.trim()
  if (!t) return t
  const q = IMAGE_PROMPT_QUALITY_SUFFIX.trim()
  if (t.toLowerCase().includes(q.slice(0, 24).toLowerCase())) return t
  return `${t}, ${q}`
}

export async function generateImage(prompt: string): Promise<string> {
  const trimmed = typeof prompt === 'string' ? prompt.trim() : ''
  if (!trimmed) throw new Error('Le prompt ne peut pas être vide.')

  const positivePrompt = withQualitySuffix(trimmed)

  const endpoint = resolveImageApiUrl()
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, image/*, */*',
    },
    body: JSON.stringify({ prompt: positivePrompt, positivePrompt }),
  })

  const ct = (response.headers.get('content-type') || '').toLowerCase()

  // Binary image body (some APIs return raw PNG/JPEG)
  if (response.ok && ct.includes('image/')) {
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  }

  const rawText = await response.text()

  if (!response.ok) {
    let msg = rawText.slice(0, 240)
    try {
      const err = JSON.parse(rawText) as { error?: unknown; message?: unknown }
      msg = String(err.error ?? err.message ?? msg)
    } catch {
      /* keep raw */
    }
    throw new Error(`Image API ${response.status}: ${msg}`)
  }

  // JSON payload
  if (ct.includes('application/json') || rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
    try {
      const data = JSON.parse(rawText) as unknown
      return extractImageReference(data)
    } catch {
      /* fall through */
    }
  }

  // Plain base64 body
  const plain = rawText.trim()
  if (plain.length > 100 && /^[A-Za-z0-9+/=\s]+$/.test(plain)) {
    return `data:image/png;base64,${plain.replace(/\s/g, '')}`
  }

  throw new Error(`Réponse inattendue (Content-Type: ${ct || '—'}). Début : ${rawText.slice(0, 120)}`)
}

export async function sendChatMessage(prompt: string): Promise<string> {
  const response = await fetch(CHAT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `Chat API error ${response.status}`)
  }

  const result = (await response.json()) as { success?: boolean; content?: string }
  if (result.success && result.content) return result.content
  throw new Error('Réponse chat invalide.')
}

/**
 * Uses chat-z to turn user intent into a concise English positive prompt fragment
 * (merged into the main fashion prompt).
 */
export async function refineCreativeNotesWithLlm(params: {
  garmentSummary: string
  logoText: string
  currentNotes: string
  userInstruction: string
}): Promise<string> {
  const { garmentSummary, logoText, currentNotes, userInstruction } = params
  const prompt = `You are a senior fashion prompt engineer for an AI image generator.

TASK: Output ONLY a single English paragraph of "additional creative direction" (no quotes, no bullet points, no preamble). Max 450 characters. Be specific about graphics, typography, placement, materials, trims, and vibe. Do not repeat the full garment list verbatim; add deltas only.

CONTEXT — garment direction (English):
${garmentSummary.slice(0, 1400)}

CONTEXT — branding / text on garments (may be empty):
${logoText.trim() ? logoText.trim().slice(0, 400) : '(none)'}

CURRENT user notes (English, may be empty):
${currentNotes.trim() ? currentNotes.trim().slice(0, 600) : '(none)'}

USER request (any language):
${userInstruction.trim().slice(0, 800)}`

  const out = await sendChatMessage(prompt)
  return out.trim().replace(/^["']|["']$/g, '')
}

/**
 * Server-only: Simple Generator (Vercel app) — fresh cookie/session per call.
 * Visits the page, POSTs /api/generate, then downloads the image bytes.
 */

const BASE = 'https://simple-generator-five.vercel.app'

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,fr;q=0.7',
  Referer: `${BASE}/?type=architecture`,
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
}

function joinUrl(base, path) {
  try {
    return new URL(path, base).toString()
  } catch {
    return `${base.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`
  }
}

/** Collect Set-Cookie name=value pairs for the next request */
function mergeSetCookie(response) {
  const list =
    typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : response.headers.get('set-cookie')
        ? [response.headers.get('set-cookie')]
        : []
  const pairs = []
  for (const line of list) {
    if (!line) continue
    const first = line.split(';')[0]?.trim()
    if (first && first.includes('=')) pairs.push(first)
  }
  return pairs.join('; ')
}

function appendCookies(existing, incoming) {
  if (!incoming) return existing || ''
  if (!existing) return incoming
  return `${existing}; ${incoming}`
}

/**
 * @param {string} positivePrompt
 * @param {{ generatorType?: string }} [opts]
 * @returns {Promise<{ contentType: string, buffer: Buffer }>}
 */
export async function fetchSimpleGeneratorImage(positivePrompt, opts = {}) {
  const generatorType = opts.generatorType ?? 'architecture'
  let cookieHeader = ''

  const visit = await fetch(`${BASE}/?type=architecture`, {
    method: 'GET',
    headers: { ...BROWSER_HEADERS, Cookie: cookieHeader },
  })
  cookieHeader = appendCookies(cookieHeader, mergeSetCookie(visit))

  const genRes = await fetch(`${BASE}/api/generate`, {
    method: 'POST',
    headers: {
      ...BROWSER_HEADERS,
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ positivePrompt, generatorType }),
  })
  cookieHeader = appendCookies(cookieHeader, mergeSetCookie(genRes))

  if (!genRes.ok) {
    const t = await genRes.text().catch(() => '')
    throw new Error(`Simple Generator ${genRes.status}: ${t.slice(0, 400)}`)
  }

  let data
  try {
    data = await genRes.json()
  } catch {
    throw new Error('Simple Generator: response was not JSON')
  }

  const rel =
    (typeof data.imageUrl === 'string' && data.imageUrl) ||
    (typeof data.url === 'string' && data.url) ||
    (typeof data.image === 'string' && data.image) ||
    null

  if (!rel) {
    const dbg = JSON.stringify(data).slice(0, 320)
    throw new Error(`Simple Generator: no image URL in response: ${dbg}`)
  }

  const full = joinUrl(BASE, rel)
  const imgRes = await fetch(full, {
    method: 'GET',
    headers: { ...BROWSER_HEADERS, Cookie: cookieHeader },
  })
  cookieHeader = appendCookies(cookieHeader, mergeSetCookie(imgRes))

  if (!imgRes.ok) {
    const t = await imgRes.text().catch(() => '')
    throw new Error(`Image download ${imgRes.status}: ${t.slice(0, 200)}`)
  }

  const ct = imgRes.headers.get('content-type') || 'image/jpeg'
  const buf = Buffer.from(await imgRes.arrayBuffer())
  return { contentType: ct, buffer: buf }
}

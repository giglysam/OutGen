/**
 * Vercel Serverless — forwards POST to image-z (JSON, raw image, or base64 body).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const r = await fetch('https://image-z.created.app/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}),
    })

    const ct = (r.headers.get('content-type') || '').toLowerCase()

    if (ct.includes('image/')) {
      const buf = Buffer.from(await r.arrayBuffer())
      res.status(r.status)
      res.setHeader('Content-Type', ct)
      res.send(buf)
      return
    }

    const text = await r.text()
    try {
      const data = JSON.parse(text)
      res.status(r.status).json(data)
    } catch {
      res.status(r.ok ? 200 : r.status).send(text)
    }
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Proxy error' })
  }
}

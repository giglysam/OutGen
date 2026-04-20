import { fetchSimpleGeneratorImage } from '../server/simpleGenerator.mjs'

/**
 * Vercel Serverless — Simple Generator: fresh session per request (visit + POST + image fetch).
 * Body: { prompt: string } or { positivePrompt: string } — full English fashion prompt.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}
    const positivePrompt = String(body.positivePrompt ?? body.prompt ?? '').trim()
    if (!positivePrompt) {
      res.status(400).json({ error: 'Missing prompt' })
      return
    }

    const { contentType, buffer } = await fetchSimpleGeneratorImage(positivePrompt, {
      generatorType: 'architecture',
    })

    res.status(200)
    res.setHeader('Content-Type', contentType)
    res.send(buffer)
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Image proxy error' })
  }
}

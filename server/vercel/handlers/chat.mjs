const CHAT_UPSTREAM = 'https://chat-z.created.app/api/chat'

export async function handleChat(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}
    const prompt = String(body.prompt ?? '').trim()
    if (!prompt) {
      res.status(400).json({ error: 'Missing prompt' })
      return
    }

    const r = await fetch(CHAT_UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    const text = await r.text()
    res.status(r.status)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.send(text)
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Chat proxy error' })
  }
}

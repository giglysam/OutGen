import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { fetchSimpleGeneratorImage } from './simpleGenerator.mjs'

const CHAT_UPSTREAM = 'https://chat-z.created.app/api/chat'

type NextFn = (err?: unknown) => void

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (ch) => chunks.push(ch as Buffer))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {})
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

/**
 * Vite dev: same-origin /api/generate-image and /api/chat (mirrors Vercel serverless).
 */
export function devApiPlugin(): Plugin {
  return {
    name: 'outgen-api-proxy-dev',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: NextFn) => {
        const path = req.url?.split('?')[0] ?? ''

        if (req.method === 'POST' && path === '/api/generate-image') {
          let body: Record<string, unknown>
          try {
            body = await readJsonBody(req)
          } catch {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid JSON body' }))
            return
          }

          const positivePrompt = String(body.positivePrompt ?? body.prompt ?? '').trim()
          if (!positivePrompt) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing prompt' }))
            return
          }

          try {
            const { contentType, buffer } = await fetchSimpleGeneratorImage(positivePrompt, {
              generatorType: 'architecture',
            })
            res.statusCode = 200
            res.setHeader('Content-Type', contentType)
            res.end(buffer)
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'Image error' }))
          }
          return
        }

        if (req.method === 'POST' && path === '/api/chat') {
          let body: Record<string, unknown>
          try {
            body = await readJsonBody(req)
          } catch {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid JSON body' }))
            return
          }

          const prompt = String(body.prompt ?? '').trim()
          if (!prompt) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing prompt' }))
            return
          }

          try {
            const r = await fetch(CHAT_UPSTREAM, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ prompt }),
            })
            const text = await r.text()
            res.statusCode = r.status
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(text)
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'Chat proxy error' }))
          }
          return
        }

        next()
      })
    },
  }
}

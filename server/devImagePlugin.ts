import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { fetchSimpleGeneratorImage } from './simpleGenerator.mjs'

type NextFn = (err?: unknown) => void

/**
 * Vite dev middleware: POST /api/generate-image → Simple Generator (same as production).
 */
export function devImagePlugin(): Plugin {
  return {
    name: 'outgen-simple-generator-dev',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: NextFn) => {
        if (req.method !== 'POST' || req.url?.split('?')[0] !== '/api/generate-image') {
          next()
          return
        }

        const chunks: Buffer[] = []
        for await (const ch of req) chunks.push(ch as Buffer)
        const raw = Buffer.concat(chunks).toString('utf8')
        let body: Record<string, unknown> = {}
        try {
          body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
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
      })
    },
  }
}

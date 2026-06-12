/**
 * One-time database bootstrap. Set SUPABASE_DB_PASSWORD and SETUP_SECRET in Vercel.
 * POST /api/setup-db with header x-setup-secret: <SETUP_SECRET>
 */
import pg from 'pg'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' })
    return
  }

  const secret = process.env.SETUP_SECRET
  if (!secret || req.headers['x-setup-secret'] !== secret) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const password = process.env.SUPABASE_DB_PASSWORD
  if (!password) {
    res.status(500).json({ error: 'SUPABASE_DB_PASSWORD not configured' })
    return
  }

  const sql = readFileSync(join(__dirname, '../supabase/migrations/001_outgen.sql'), 'utf8')
  const client = new pg.Client({
    host: process.env.SUPABASE_DB_HOST || 'aws-0-us-west-1.pooler.supabase.com',
    port: Number(process.env.SUPABASE_DB_PORT || 5432),
    database: 'postgres',
    user: process.env.SUPABASE_DB_USER || 'postgres.gdmucpihztlberwaqtwk',
    password,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    await client.query(sql)
    res.status(200).json({ ok: true, message: 'Migration applied' })
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Migration failed' })
  } finally {
    await client.end()
  }
}

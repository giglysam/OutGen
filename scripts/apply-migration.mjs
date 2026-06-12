#!/usr/bin/env node
/**
 * Apply supabase/migrations/001_outgen.sql using SUPABASE_DB_PASSWORD or service role.
 * Usage: SUPABASE_DB_PASSWORD=... node scripts/apply-migration.mjs
 */
import pg from 'pg'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, '../supabase/migrations/001_outgen.sql'), 'utf8')

const password = process.env.SUPABASE_DB_PASSWORD
if (!password) {
  console.error('Set SUPABASE_DB_PASSWORD (Database password from Supabase Dashboard → Settings → Database).')
  process.exit(1)
}

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
  console.log('Migration applied successfully.')
} catch (e) {
  console.error('Migration failed:', e.message)
  process.exit(1)
} finally {
  await client.end()
}

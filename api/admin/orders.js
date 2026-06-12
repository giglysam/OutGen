import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'

export default async function handler(req, res) {
  const secret = process.env.ADMIN_SECRET
  const provided = req.headers['x-admin-secret'] || req.query?.secret

  if (!secret || provided !== secret) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  if (req.method === 'GET') {
    try {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from('print_orders')
        .select(
          `
          id, product_type, quality, quantity, credits_total, maps_url, status, eta_days, created_at,
          profiles ( email, display_name, city, country, address_line ),
          designs ( title, thumbnail_url )
        `,
        )
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw new Error(error.message)
      res.status(200).json({ orders: data ?? [] })
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : 'Failed to load orders' })
    }
    return
  }

  if (req.method === 'PATCH') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}
      const { orderId, status } = body
      if (!orderId || !status) {
        res.status(400).json({ error: 'orderId and status required' })
        return
      }

      const supabase = getSupabaseAdmin()
      const { error } = await supabase.from('print_orders').update({ status }).eq('id', orderId)
      if (error) throw new Error(error.message)
      res.status(200).json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : 'Update failed' })
    }
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}

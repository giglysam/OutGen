import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { verifyAdmin, toCsv } from '../lib/adminAuth.mjs'

export default async function handler(req, res) {
  if (!verifyAdmin(req, res)) return

  if (req.method === 'GET') {
    try {
      const supabase = getSupabaseAdmin()
      const format = req.query?.format || 'json'
      const { data, error } = await supabase
        .from('print_orders')
        .select(
          `
          id, user_id, product_type, quality, quantity, credits_total, maps_url, status, eta_days,
          tracking_number, tracking_url, status_note, shipped_at, delivered_at, created_at, updated_at,
          profiles ( email, display_name, city, country, address_line ),
          designs ( title, thumbnail_url )
        `,
        )
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw new Error(error.message)

      if (format === 'csv') {
        const csv = toCsv(data ?? [], [
          { label: 'order_id', value: (r) => r.id },
          { label: 'status', value: (r) => r.status },
          { label: 'product', value: (r) => r.product_type },
          { label: 'quality', value: (r) => r.quality },
          { label: 'quantity', value: (r) => r.quantity },
          { label: 'credits', value: (r) => r.credits_total },
          { label: 'email', value: (r) => r.profiles?.email },
          { label: 'name', value: (r) => r.profiles?.display_name },
          { label: 'city', value: (r) => r.profiles?.city },
          { label: 'country', value: (r) => r.profiles?.country },
          { label: 'tracking_number', value: (r) => r.tracking_number },
          { label: 'created_at', value: (r) => r.created_at },
        ])
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="outgen-orders.csv"')
        res.status(200).send(csv)
        return
      }

      res.status(200).json({ orders: data ?? [] })
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : 'Failed to load orders' })
    }
    return
  }

  if (req.method === 'PATCH') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}
      const { orderId, status, trackingNumber, trackingUrl, statusNote } = body
      if (!orderId) {
        res.status(400).json({ error: 'orderId required' })
        return
      }

      const patch = { updated_at: new Date().toISOString() }
      if (status) patch.status = status
      if (trackingNumber !== undefined) patch.tracking_number = trackingNumber || null
      if (trackingUrl !== undefined) patch.tracking_url = trackingUrl || null
      if (statusNote !== undefined) patch.status_note = statusNote || null
      if (status === 'shipped' && !body.shippedAt) patch.shipped_at = new Date().toISOString()
      if (status === 'delivered') patch.delivered_at = new Date().toISOString()

      const supabase = getSupabaseAdmin()
      const { error } = await supabase.from('print_orders').update(patch).eq('id', orderId)
      if (error) throw new Error(error.message)
      res.status(200).json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : 'Update failed' })
    }
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}

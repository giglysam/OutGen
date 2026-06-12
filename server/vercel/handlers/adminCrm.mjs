import { getSupabaseAdmin } from '../supabaseAdmin.mjs'
import { verifyAdmin, toCsv } from '../adminAuth.mjs'

function dayKey(iso) {
  return iso ? iso.slice(0, 10) : ''
}

function bucketByDay(rows, dateField, days = 14) {
  const out = {}
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    out[d.toISOString().slice(0, 10)] = 0
  }
  for (const row of rows) {
    const k = dayKey(row[dateField])
    if (k in out) out[k] += 1
  }
  return Object.entries(out).map(([date, count]) => ({ date, count }))
}

export async function handleAdminCrm(req, res) {
  if (!verifyAdmin(req, res)) return
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const view = req.query?.view || 'stats'
  const format = req.query?.format || 'json'
  const limit = Math.min(500, Math.max(1, Number(req.query?.limit) || 200))

  try {
    const supabase = getSupabaseAdmin()

    if (view === 'stats') {
      const [profiles, designs, orders, signups, txs] = await Promise.all([
        supabase.from('profiles').select('id, country, city, created_at, credits_balance, subscription_active'),
        supabase.from('designs').select('id, created_at, thumbnail_url'),
        supabase.from('print_orders').select('id, status, credits_total, created_at'),
        supabase.from('signup_attempts').select('id, blocked, vpn_detected, created_at'),
        supabase.from('credit_transactions').select('delta, reason, created_at'),
      ])

      for (const q of [profiles, designs, orders, signups, txs]) {
        if (q.error) throw new Error(q.error.message)
      }

      const users = profiles.data ?? []
      const designRows = designs.data ?? []
      const orderRows = orders.data ?? []
      const signupRows = signups.data ?? []
      const txRows = txs.data ?? []

      const ordersByStatus = {}
      for (const o of orderRows) ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1

      const countries = {}
      for (const u of users) {
        const c = u.country?.trim() || 'Unknown'
        countries[c] = (countries[c] ?? 0) + 1
      }

      const creditsInCirculation = users.reduce((s, u) => s + (u.credits_balance ?? 0), 0)
      const creditsSpent = txRows.filter((t) => t.delta < 0).reduce((s, t) => s + Math.abs(t.delta), 0)
      const creditsGranted = txRows.filter((t) => t.delta > 0).reduce((s, t) => s + t.delta, 0)

      res.status(200).json({
        totals: {
          users: users.length,
          designs: designRows.length,
          designsWithImage: designRows.filter((d) => d.thumbnail_url).length,
          orders: orderRows.length,
          signupAttempts: signupRows.length,
          blockedSignups: signupRows.filter((s) => s.blocked).length,
          subscribers: users.filter((u) => u.subscription_active).length,
          creditsInCirculation,
          creditsSpent,
          creditsGranted,
        },
        ordersByStatus,
        countries: Object.entries(countries)
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 15),
        signupsByDay: bucketByDay(users, 'created_at'),
        designsByDay: bucketByDay(designRows, 'created_at'),
        ordersByDay: bucketByDay(orderRows, 'created_at'),
      })
      return
    }

    if (view === 'users') {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, email, display_name, city, country, address_line, credits_balance, subscription_active, signup_ip, vpn_flag, onboarding_complete, created_at, updated_at',
        )
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw new Error(error.message)

      if (format === 'csv') {
        const csv = toCsv(data ?? [], [
          { label: 'id', value: (r) => r.id },
          { label: 'email', value: (r) => r.email },
          { label: 'name', value: (r) => r.display_name },
          { label: 'city', value: (r) => r.city },
          { label: 'country', value: (r) => r.country },
          { label: 'credits', value: (r) => r.credits_balance },
          { label: 'subscription', value: (r) => r.subscription_active },
          { label: 'vpn_flag', value: (r) => r.vpn_flag },
          { label: 'created_at', value: (r) => r.created_at },
        ])
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="outgen-users.csv"')
        res.status(200).send(csv)
        return
      }
      res.status(200).json({ users: data ?? [] })
      return
    }

    if (view === 'designs') {
      const { data, error } = await supabase
        .from('designs')
        .select(
          `id, title, thumbnail_url, logo_description, created_at, updated_at,
          profiles ( email, display_name, city, country )`,
        )
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw new Error(error.message)

      if (format === 'csv') {
        const csv = toCsv(data ?? [], [
          { label: 'id', value: (r) => r.id },
          { label: 'title', value: (r) => r.title },
          { label: 'user_email', value: (r) => r.profiles?.email },
          { label: 'user_name', value: (r) => r.profiles?.display_name },
          { label: 'country', value: (r) => r.profiles?.country },
          { label: 'has_image', value: (r) => Boolean(r.thumbnail_url) },
          { label: 'created_at', value: (r) => r.created_at },
        ])
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="outgen-designs.csv"')
        res.status(200).send(csv)
        return
      }
      res.status(200).json({ designs: data ?? [] })
      return
    }

    if (view === 'signups') {
      const { data, error } = await supabase
        .from('signup_attempts')
        .select('id, ip, device_id, vpn_detected, blocked, reason, email, created_at')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw new Error(error.message)

      if (format === 'csv') {
        const csv = toCsv(data ?? [], [
          { label: 'email', value: (r) => r.email },
          { label: 'ip', value: (r) => r.ip },
          { label: 'device_id', value: (r) => r.device_id },
          { label: 'vpn', value: (r) => r.vpn_detected },
          { label: 'blocked', value: (r) => r.blocked },
          { label: 'reason', value: (r) => r.reason },
          { label: 'created_at', value: (r) => r.created_at },
        ])
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="outgen-signups.csv"')
        res.status(200).send(csv)
        return
      }
      res.status(200).json({ signups: data ?? [] })
      return
    }

    if (view === 'transactions') {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select(`id, delta, reason, created_at, profiles ( email, display_name )`)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw new Error(error.message)

      if (format === 'csv') {
        const csv = toCsv(data ?? [], [
          { label: 'email', value: (r) => r.profiles?.email },
          { label: 'delta', value: (r) => r.delta },
          { label: 'reason', value: (r) => r.reason },
          { label: 'created_at', value: (r) => r.created_at },
        ])
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="outgen-credits.csv"')
        res.status(200).send(csv)
        return
      }
      res.status(200).json({ transactions: data ?? [] })
      return
    }

    res.status(400).json({ error: 'Unknown view. Use stats|users|designs|signups|transactions' })
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'CRM request failed' })
  }
}

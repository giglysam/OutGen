import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { verifyAdmin } from '../lib/adminAuth.mjs'

export default async function handler(req, res) {
  if (!verifyAdmin(req, res)) return

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}
    const { userId, email, amount, reason } = body
    const creditAmount = Number(amount)

    if (!creditAmount || creditAmount <= 0 || creditAmount > 500) {
      res.status(400).json({ error: 'amount must be 1–500' })
      return
    }

    const supabase = getSupabaseAdmin()
    let targetId = userId

    if (!targetId && email) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', email.trim())
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!data) {
        res.status(404).json({ error: 'User not found for email' })
        return
      }
      targetId = data.id
    }

    if (!targetId) {
      res.status(400).json({ error: 'userId or email required' })
      return
    }

    const { data, error } = await supabase.rpc('admin_grant_credits', {
      p_user_id: targetId,
      p_amount: creditAmount,
      p_reason: reason || 'admin_grant',
    })

    if (error) throw new Error(error.message)

    res.status(200).json({ ok: true, userId: targetId, newBalance: data })
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Credit grant failed' })
  }
}

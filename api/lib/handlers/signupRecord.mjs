import { getSupabaseAdmin, verifyUserToken } from '../supabaseAdmin.mjs'
import { clientIp, lookupIp } from '../ipCheck.mjs'

export async function handleRecordSignup(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const user = await verifyUserToken(req.headers.authorization)
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}
    const deviceId = String(body.deviceId ?? '').trim()
    const ip = clientIp(req)
    const intel = await lookupIp(ip)

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('profiles')
      .update({
        signup_ip: ip,
        device_id: deviceId || null,
        vpn_flag: intel.vpn || intel.proxy || intel.hosting,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) throw new Error(error.message)

    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Record failed' })
  }
}

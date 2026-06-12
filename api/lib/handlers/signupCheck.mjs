import { getSupabaseAdmin } from '../supabaseAdmin.mjs'
import { clientIp, lookupIp, MAX_ACCOUNTS_PER_IP } from '../ipCheck.mjs'

export async function handleSignupCheck(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}
    const deviceId = String(body.deviceId ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()

    const ip = clientIp(req)
    const intel = await lookupIp(ip)
    const vpnOrProxy = intel.vpn || intel.proxy || intel.hosting

    let blocked = false
    let reason = null

    if (vpnOrProxy) {
      blocked = true
      reason = 'Please turn off VPN or proxy, then try again.'
    }

    const supabase = getSupabaseAdmin()

    if (!blocked && ip !== '0.0.0.0') {
      const { count: ipCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('signup_ip', ip)

      if ((ipCount ?? 0) >= MAX_ACCOUNTS_PER_IP) {
        blocked = true
        reason = 'An account already exists on this network. Please sign in instead.'
      }
    }

    if (!blocked && deviceId) {
      const { count: deviceCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('device_id', deviceId)

      if ((deviceCount ?? 0) >= MAX_ACCOUNTS_PER_IP) {
        blocked = true
        reason = 'This device already has an account. Please sign in instead.'
      }
    }

    await supabase.from('signup_attempts').insert({
      ip,
      device_id: deviceId || null,
      vpn_detected: vpnOrProxy,
      blocked,
      reason,
      email: email || null,
    })

    if (blocked) {
      res.status(403).json({ allowed: false, reason })
      return
    }

    res.status(200).json({
      allowed: true,
      vpn: vpnOrProxy,
      ip,
    })
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Check failed' })
  }
}

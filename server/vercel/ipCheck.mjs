export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  if (typeof req.headers['x-real-ip'] === 'string') {
    return req.headers['x-real-ip']
  }
  return req.socket?.remoteAddress || '0.0.0.0'
}

/** ipwho.is — free, includes VPN/proxy flags */
export async function lookupIp(ip) {
  if (!ip || ip === '0.0.0.0' || ip.startsWith('127.') || ip === '::1') {
    return { vpn: false, proxy: false, hosting: false, country: null }
  }

  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { vpn: false, proxy: false, hosting: false, country: null }
    const data = await res.json()
    const sec = data.security || {}
    return {
      vpn: Boolean(sec.vpn),
      proxy: Boolean(sec.proxy),
      hosting: Boolean(sec.hosting),
      country: data.country_code || null,
    }
  } catch {
    return { vpn: false, proxy: false, hosting: false, country: null }
  }
}

export const MAX_ACCOUNTS_PER_IP = 1

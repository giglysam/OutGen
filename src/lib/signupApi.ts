import { getDeviceId } from './deviceId'
import { getSupabase } from './supabase'

export async function checkSignupAllowed(email: string): Promise<{ allowed: boolean; reason?: string }> {
  const res = await fetch('/api/signup-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: getDeviceId(), email }),
  })
  const data = (await res.json()) as { allowed?: boolean; reason?: string; error?: string }
  if (!res.ok) {
    return { allowed: false, reason: data.reason || data.error || 'Sign up not allowed' }
  }
  return { allowed: Boolean(data.allowed), reason: data.reason }
}

export async function recordSignupMetadata(): Promise<void> {
  const { data } = await getSupabase().auth.getSession()
  const token = data.session?.access_token
  if (!token) return

  await fetch('/api/record-signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ deviceId: getDeviceId() }),
  })
}

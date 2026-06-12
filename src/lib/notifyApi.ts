import { getSupabase } from './supabase'

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await getSupabase().auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Sign in required')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export async function notifyPrintOrder(payload: {
  orderId: string
  designTitle: string
  thumbnailUrl: string | null
  productLabel: string
  qualityLabel: string
  quantity: number
  creditsTotal: number
  mapsUrl: string
  userName: string
  userEmail: string
  city?: string | null
  country?: string | null
  addressLine?: string | null
}): Promise<void> {
  const res = await fetch('/api/notify-print-order', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || 'Could not send order notification')
  }
}

export async function notifyPurchaseRequest(payload: {
  type: 'subscription' | 'credits'
  creditAmount?: number
  userEmail: string
  userName: string
}): Promise<void> {
  const res = await fetch('/api/notify-purchase', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || 'Could not send payment notification')
  }
}


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

export async function fetchAdminOrders(adminSecret: string): Promise<AdminOrder[]> {
  const res = await fetch('/api/admin/orders', {
    headers: { 'x-admin-secret': adminSecret },
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || 'Could not load orders')
  }
  const data = (await res.json()) as { orders: AdminOrder[] }
  return data.orders
}

export async function updateOrderStatus(
  adminSecret: string,
  orderId: string,
  status: string,
): Promise<void> {
  const res = await fetch('/api/admin/orders', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': adminSecret,
    },
    body: JSON.stringify({ orderId, status }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || 'Could not update order')
  }
}

export type AdminOrder = {
  id: string
  product_type: string
  quality: string
  quantity: number
  credits_total: number
  maps_url: string
  status: string
  eta_days: number
  created_at: string
  profiles: {
    email: string | null
    display_name: string | null
    city: string | null
    country: string | null
    address_line: string | null
  } | null
  designs: {
    title: string | null
    thumbnail_url: string | null
  } | null
}

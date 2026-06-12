export type AdminOrder = {
  id: string
  user_id: string
  product_type: string
  quality: string
  quantity: number
  credits_total: number
  maps_url: string
  status: string
  eta_days: number
  tracking_number: string | null
  tracking_url: string | null
  status_note: string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
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

export type AdminStats = {
  totals: {
    users: number
    designs: number
    designsWithImage: number
    orders: number
    signupAttempts: number
    blockedSignups: number
    subscribers: number
    creditsInCirculation: number
    creditsSpent: number
    creditsGranted: number
  }
  ordersByStatus: Record<string, number>
  countries: { country: string; count: number }[]
  signupsByDay: { date: string; count: number }[]
  designsByDay: { date: string; count: number }[]
  ordersByDay: { date: string; count: number }[]
}

export type AdminUser = {
  id: string
  email: string | null
  display_name: string | null
  city: string | null
  country: string | null
  address_line: string | null
  credits_balance: number
  subscription_active: boolean
  signup_ip: string | null
  vpn_flag: boolean
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export type AdminDesign = {
  id: string
  title: string
  thumbnail_url: string | null
  logo_description: string
  created_at: string
  updated_at: string
  profiles: {
    email: string | null
    display_name: string | null
    city: string | null
    country: string | null
  } | null
}

function adminHeaders(secret: string): HeadersInit {
  return { 'x-admin-secret': secret }
}

export async function fetchAdminOrders(adminSecret: string): Promise<AdminOrder[]> {
  const res = await fetch('/api/admin/orders', { headers: adminHeaders(adminSecret) })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || 'Could not load orders')
  }
  const data = (await res.json()) as { orders: AdminOrder[] }
  return data.orders
}

export async function updateOrderStatus(
  adminSecret: string,
  payload: {
    orderId: string
    status?: string
    trackingNumber?: string
    trackingUrl?: string
    statusNote?: string
  },
): Promise<void> {
  const res = await fetch('/api/admin/orders', {
    method: 'PATCH',
    headers: { ...adminHeaders(adminSecret), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: payload.orderId,
      status: payload.status,
      trackingNumber: payload.trackingNumber,
      trackingUrl: payload.trackingUrl,
      statusNote: payload.statusNote,
    }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || 'Could not update order')
  }
}

export async function fetchAdminStats(adminSecret: string): Promise<AdminStats> {
  const res = await fetch('/api/admin/crm?view=stats', { headers: adminHeaders(adminSecret) })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || 'Could not load stats')
  }
  return res.json() as Promise<AdminStats>
}

export async function fetchAdminUsers(adminSecret: string): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/crm?view=users', { headers: adminHeaders(adminSecret) })
  if (!res.ok) throw new Error('Could not load users')
  const data = (await res.json()) as { users: AdminUser[] }
  return data.users
}

export async function fetchAdminDesigns(adminSecret: string): Promise<AdminDesign[]> {
  const res = await fetch('/api/admin/crm?view=designs', { headers: adminHeaders(adminSecret) })
  if (!res.ok) throw new Error('Could not load designs')
  const data = (await res.json()) as { designs: AdminDesign[] }
  return data.designs
}

export async function grantAdminCredits(
  adminSecret: string,
  payload: { userId?: string; email?: string; amount: number; reason?: string },
): Promise<{ newBalance: number; userId: string }> {
  const res = await fetch('/api/admin/credits', {
    method: 'POST',
    headers: { ...adminHeaders(adminSecret), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || 'Could not grant credits')
  }
  const data = (await res.json()) as { newBalance: number; userId: string }
  return data
}

export function adminExportUrl(secret: string, view: 'users' | 'designs' | 'orders' | 'signups' | 'transactions') {
  const path =
    view === 'orders'
      ? `/api/admin/orders?format=csv`
      : `/api/admin/crm?view=${view}&format=csv`
  return `${path}&secret=${encodeURIComponent(secret)}`
}

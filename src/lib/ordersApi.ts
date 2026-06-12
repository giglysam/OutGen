import { getSupabase } from './supabase'

export type PrintOrderStatus = 'pending' | 'production' | 'shipped' | 'delivered'

export type UserPrintOrder = {
  id: string
  product_type: string
  quality: string
  quantity: number
  credits_total: number
  maps_url: string
  status: PrintOrderStatus
  eta_days: number
  tracking_number: string | null
  tracking_url: string | null
  status_note: string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  designs: {
    title: string | null
    thumbnail_url: string | null
  } | null
}

const ORDER_STATUSES: PrintOrderStatus[] = ['pending', 'production', 'shipped', 'delivered']

export function orderStatusIndex(status: string): number {
  const i = ORDER_STATUSES.indexOf(status as PrintOrderStatus)
  return i >= 0 ? i : 0
}

export function orderStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Order received'
    case 'production':
      return 'Printing'
    case 'shipped':
      return 'Shipped'
    case 'delivered':
      return 'Delivered'
    default:
      return status
  }
}

export async function fetchMyPrintOrders(): Promise<UserPrintOrder[]> {
  const { data: auth } = await getSupabase().auth.getUser()
  const userId = auth.user?.id
  if (!userId) throw new Error('Sign in required')

  const { data, error } = await getSupabase()
    .from('print_orders')
    .select(
      `
      id, product_type, quality, quantity, credits_total, maps_url, status, eta_days,
      tracking_number, tracking_url, status_note, shipped_at, delivered_at, created_at, updated_at,
      designs ( title, thumbnail_url )
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>
    const designs = r.designs
    const design =
      Array.isArray(designs) && designs[0]
        ? (designs[0] as UserPrintOrder['designs'])
        : (designs as UserPrintOrder['designs'])
    return { ...r, designs: design ?? null } as UserPrintOrder
  })
}

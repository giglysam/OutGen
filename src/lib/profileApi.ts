import { getSupabase } from './supabase'

export type UserProfile = {
  id: string
  email: string | null
  display_name: string | null
  city: string | null
  country: string | null
  address_line: string | null
  maps_url: string | null
  credits_balance: number
  subscription_active: boolean
}

export type ProfileUpdate = Partial<
  Pick<UserProfile, 'display_name' | 'city' | 'country' | 'address_line' | 'maps_url'>
>

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await getSupabase().from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw new Error(error.message)
  return data as UserProfile | null
}

export async function updateProfile(userId: string, patch: ProfileUpdate): Promise<UserProfile> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as UserProfile
}

export async function placePrintOrder(params: {
  designId: string
  productType: string
  quality: string
  quantity: number
  mapsUrl: string
}): Promise<string> {
  const { data, error } = await getSupabase().rpc('place_print_order', {
    p_design_id: params.designId,
    p_product_type: params.productType,
    p_quality: params.quality,
    p_quantity: params.quantity,
    p_maps_url: params.mapsUrl,
  })

  if (error) throw new Error(error.message)
  return String(data)
}

export async function activateSubscription(): Promise<number> {
  const { data, error } = await getSupabase().rpc('activate_studio_subscription')
  if (error) throw new Error(error.message)
  return Number(data)
}

export async function purchaseCredits(amount: number): Promise<number> {
  const { data, error } = await getSupabase().rpc('add_credits', {
    p_amount: amount,
    p_reason: 'credit_purchase',
  })
  if (error) throw new Error(error.message)
  return Number(data)
}

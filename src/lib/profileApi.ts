import { getSupabase } from './supabase'

export type UserProfile = {
  id: string
  email: string | null
  display_name: string | null
  city: string | null
  country: string | null
  address_line: string | null
  maps_url: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  credits_balance: number
  subscription_active: boolean
  onboarding_complete: boolean
}

export type ProfileUpdate = Partial<
  Pick<
    UserProfile,
    | 'display_name'
    | 'city'
    | 'country'
    | 'address_line'
    | 'maps_url'
    | 'latitude'
    | 'longitude'
    | 'phone'
    | 'onboarding_complete'
  >
>

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select(
      'id, email, display_name, city, country, address_line, maps_url, latitude, longitude, phone, credits_balance, subscription_active, onboarding_complete',
    )
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return {
    ...(data as UserProfile),
    onboarding_complete: (data as UserProfile).onboarding_complete ?? false,
  }
}

export async function updateProfile(userId: string, patch: ProfileUpdate): Promise<UserProfile> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) payload[k] = v
  }

  const { data, error } = await getSupabase()
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select(
      'id, email, display_name, city, country, address_line, maps_url, latitude, longitude, phone, credits_balance, subscription_active, onboarding_complete',
    )
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

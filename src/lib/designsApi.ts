import type { GeneratedViews, OutfitSelection } from '../types'
import { inferPrintProduct } from './designCategory'
import type { PrintProductId } from './credits'
import { compressImageUrl } from './compressImage'
import { DEFAULT_OUTFIT_SELECTION, normalizeSelection } from './normalizeSelection'
import { getSupabase } from './supabase'

export type DesignRow = {
  id: string
  user_id: string
  title: string
  selection: OutfitSelection
  logo_description: string
  user_prompt: string
  generated_views: GeneratedViews
  thumbnail_url: string | null
  created_at: string
  updated_at: string
  print_product: PrintProductId
}

export type DesignSummary = {
  id: string
  title: string
  thumbnail_url: string | null
  print_product: PrintProductId
  updated_at: string
}

/** Only persist a compressed front view — keeps saves small & cross-device reliable */
async function cloudViews(views: GeneratedViews): Promise<{
  generated_views: GeneratedViews
  thumbnail_url: string | null
}> {
  const front = views.front
  if (!front) {
    return { generated_views: {}, thumbnail_url: null }
  }
  const compressed = await compressImageUrl(front)
  return {
    generated_views: { front: compressed },
    thumbnail_url: compressed,
  }
}

export async function listDesigns(userId: string): Promise<DesignSummary[]> {
  const { data, error } = await getSupabase()
    .from('designs')
    .select('id, title, thumbnail_url, updated_at, selection')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => {
    const r = row as {
      id: string
      title: string
      thumbnail_url: string | null
      updated_at: string
      selection?: OutfitSelection
    }
    return {
      id: r.id,
      title: r.title,
      thumbnail_url: r.thumbnail_url,
      updated_at: r.updated_at,
      print_product: inferPrintProduct(normalizeSelection(r.selection)),
    }
  })
}

export async function fetchDesign(id: string): Promise<DesignRow> {
  const { data, error } = await getSupabase()
    .from('designs')
    .select(
      'id, user_id, title, selection, logo_description, user_prompt, generated_views, thumbnail_url, created_at, updated_at',
    )
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)

  const row = data as Omit<DesignRow, 'print_product'>
  const selection = normalizeSelection(row.selection)
  return {
    ...row,
    selection,
    logo_description: row.logo_description ?? '',
    user_prompt: row.user_prompt ?? '',
    generated_views: row.generated_views ?? {},
    print_product: inferPrintProduct(selection),
  }
}

export async function createDesign(userId: string, title = 'Untitled design'): Promise<string> {
  const { data, error } = await getSupabase()
    .from('designs')
    .insert({
      user_id: userId,
      title,
      selection: DEFAULT_OUTFIT_SELECTION,
      logo_description: '',
      user_prompt: '',
      generated_views: {},
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data.id as string
}

export async function saveDesign(params: {
  id: string
  title: string
  selection: OutfitSelection
  logoDescription: string
  userPrompt: string
  generated: GeneratedViews
}): Promise<void> {
  const { generated_views, thumbnail_url } = await cloudViews(params.generated)

  const { error } = await getSupabase()
    .from('designs')
    .update({
      title: params.title.trim() || 'Untitled design',
      selection: normalizeSelection(params.selection),
      logo_description: params.logoDescription,
      user_prompt: params.userPrompt,
      generated_views,
      thumbnail_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  if (error) throw new Error(error.message)
}

export async function deleteDesign(id: string): Promise<void> {
  const { error } = await getSupabase().from('designs').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

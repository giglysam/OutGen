import type { GeneratedViews, OutfitSelection } from '../types'
import { inferPrintProduct } from './designCategory'
import type { PrintProductId } from './credits'
import { getSupabase } from './supabase'

const emptySelection: OutfitSelection = {
  meshIds: [],
  fitId: null,
  fabricId: null,
  colorId: null,
  collarId: null,
  sleeveId: null,
  detailIds: [],
  patternId: null,
  finishId: null,
}

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
  /** Derived from selection — not a required DB column */
  print_product: PrintProductId
}

export type DesignSummary = {
  id: string
  title: string
  thumbnail_url: string | null
  print_product: PrintProductId
  updated_at: string
}

function withPrintProduct<T extends { selection?: OutfitSelection | null }>(
  row: T,
): T & { print_product: PrintProductId } {
  const selection = row.selection ?? emptySelection
  return { ...row, print_product: inferPrintProduct(selection) }
}

async function persistableViews(views: GeneratedViews): Promise<GeneratedViews> {
  const out: GeneratedViews = {}
  for (const [angle, url] of Object.entries(views)) {
    if (!url) continue
    if (url.startsWith('blob:')) {
      try {
        const res = await fetch(url)
        const blob = await res.blob()
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader()
          r.onload = () => resolve(String(r.result))
          r.onerror = reject
          r.readAsDataURL(blob)
        })
        out[angle as keyof GeneratedViews] = dataUrl
      } catch {
        /* skip broken blob */
      }
    } else {
      out[angle as keyof GeneratedViews] = url
    }
  }
  return out
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
      print_product: inferPrintProduct(r.selection ?? emptySelection),
    }
  })
}

export async function fetchDesign(id: string): Promise<DesignRow> {
  const { data, error } = await getSupabase().from('designs').select('*').eq('id', id).single()
  if (error) throw new Error(error.message)
  return withPrintProduct(data as DesignRow) as DesignRow
}

export async function createDesign(userId: string, title = 'Untitled design'): Promise<string> {
  const { data, error } = await getSupabase()
    .from('designs')
    .insert({
      user_id: userId,
      title,
      selection: {},
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
  const views = await persistableViews(params.generated)
  const thumbnail = views.front ?? null

  const { error } = await getSupabase()
    .from('designs')
    .update({
      title: params.title,
      selection: params.selection,
      logo_description: params.logoDescription,
      user_prompt: params.userPrompt,
      generated_views: views,
      thumbnail_url: thumbnail,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  if (error) throw new Error(error.message)
}

export async function deleteDesign(id: string): Promise<void> {
  const { error } = await getSupabase().from('designs').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

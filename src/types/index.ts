import type { PlanId } from '../lib/constants'

export type ViewAngle = 'front' | 'back' | 'left' | 'right' | 'top' | 'down'

export interface PromptItem {
  id: string
  label: string
  /** English fragment for the image model */
  prompt: string
  category?: string
}

export interface OutfitSelection {
  meshIds: string[]
  fitId: string | null
  fabricId: string | null
  colorId: string | null
  collarId: string | null
  sleeveId: string | null
  detailIds: string[]
  patternId: string | null
  finishId: string | null
}

export interface UserSession {
  email: string
  name: string
  plan: PlanId
  createdAt: string
}

export type GeneratedViews = Partial<Record<ViewAngle, string>>

export interface ToastMessage {
  id: string
  type: 'info' | 'success' | 'error'
  text: string
}

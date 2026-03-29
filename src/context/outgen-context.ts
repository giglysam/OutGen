import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { GeneratedViews, OutfitSelection, ToastMessage, UserSession, ViewAngle } from '../types'
import type { PlanId } from '../lib/constants'

export type OutGenContextValue = {
  user: UserSession | null
  selection: OutfitSelection
  setSelection: Dispatch<SetStateAction<OutfitSelection>>
  logoDescription: string
  setLogoDescription: (v: string) => void
  userPrompt: string
  setUserPrompt: (v: string) => void
  generated: GeneratedViews
  /** Merge partial previews (e.g. live front) without clearing other angles */
  patchGenerated: (patch: Partial<GeneratedViews>) => void
  generating: boolean
  generateProgress: string | null
  guestUsed: number
  guestLimit: number
  toasts: ToastMessage[]
  dismissToast: (id: string) => void
  authOpen: boolean
  setAuthOpen: (v: boolean) => void
  chatOpen: boolean
  setChatOpen: (v: boolean) => void
  signIn: (email: string, password: string) => void
  signUp: (email: string, password: string, name: string, plan: PlanId) => void
  signOut: () => void
  updatePlan: (plan: PlanId) => void
  generateOutfitMultiView: () => Promise<void>
  regenerateAngle: (angle: ViewAngle) => Promise<void>
  generateSocialVideo: () => Promise<void>
  generateMarketingKit: () => Promise<void>
  marketingDraft: string | null
  canUseVideo: boolean
  canUseMarketing: boolean
}

export const OutGenContext = createContext<OutGenContextValue | null>(null)

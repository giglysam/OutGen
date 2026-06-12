import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { DesignSummary } from '../lib/designsApi'
import type { ProfileUpdate, UserProfile } from '../lib/profileApi'
import type { GeneratedViews, OutfitSelection, ToastMessage, UserSession, ViewAngle } from '../types'
import type { PlanId } from '../lib/constants'

export type OutGenContextValue = {
  user: UserSession | null
  profile: UserProfile | null
  authReady: boolean
  selection: OutfitSelection
  setSelection: Dispatch<SetStateAction<OutfitSelection>>
  logoDescription: string
  setLogoDescription: Dispatch<SetStateAction<string>>
  userPrompt: string
  setUserPrompt: Dispatch<SetStateAction<string>>
  applyRefinedNotes: (nextNotes: string) => void
  designId: string | null
  designTitle: string
  setDesignTitle: (title: string) => void
  designs: DesignSummary[]
  savingDesign: boolean
  saveCurrentDesign: () => Promise<void>
  loadDesignById: (id: string) => Promise<void>
  startNewDesign: () => Promise<void>
  refreshDesigns: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfileFields: (patch: ProfileUpdate) => Promise<void>
  requestSubscription: () => Promise<void>
  requestCredits: (amount: number) => Promise<void>
  generated: GeneratedViews
  patchGenerated: (patch: Partial<GeneratedViews>) => void
  generating: boolean
  generateProgress: string | null
  guestUsed: number
  guestLimit: number
  toasts: ToastMessage[]
  dismissToast: (id: string) => void
  authOpen: boolean
  setAuthOpen: (v: boolean) => void
  onboardingOpen: boolean
  completeOnboarding: (fields: ProfileUpdate) => Promise<void>
  deleteDesignById: (id: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
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

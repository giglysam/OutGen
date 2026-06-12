import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SetStateAction,
} from 'react'
import type { GeneratedViews, OutfitSelection, ToastMessage, UserSession, ViewAngle } from '../types'
import { buildFullPrompt, VIEW_ORDER } from '../lib/promptBuilder'
import { generateImage, sendChatMessage } from '../lib/api'
import { guestCanGenerate, getGuestGenerationCount, incrementGuestGenerationCount } from '../lib/guestTrials'
import { mergeGeneratedViews, revokeGeneratedUrl } from '../lib/generatedImageUrl'
import type { PlanId } from '../lib/constants'
import { OutGenContext, type OutGenContextValue } from './outgen-context'
import { getSupabase } from '../lib/supabase'
import {
  createDesign,
  deleteDesign,
  fetchDesign,
  listDesigns,
  saveDesign,
  type DesignSummary,
} from '../lib/designsApi'
import { checkSignupAllowed, recordSignupMetadata } from '../lib/signupApi'
import { fetchProfile, updateProfile, type ProfileUpdate, type UserProfile } from '../lib/profileApi'
import { notifyPurchaseRequest } from '../lib/notifyApi'
import { creditsPayMessage, subscriptionPayMessage, whatsAppPayUrl } from '../lib/whatsapp'
import { DEFAULT_OUTFIT_SELECTION, normalizeSelection } from '../lib/normalizeSelection'

let toastSeq = 0
function nextToastId() {
  toastSeq += 1
  return `t-${toastSeq}`
}

function sessionFromAuth(
  id: string,
  email: string,
  name: string,
  subscriptionActive: boolean,
): UserSession {
  return {
    id,
    email,
    name,
    plan: subscriptionActive ? 'premium' : 'classic',
  }
}

export function OutGenProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [selection, setSelectionState] = useState<OutfitSelection>(DEFAULT_OUTFIT_SELECTION)

  const setSelection = useCallback((value: SetStateAction<OutfitSelection>) => {
    setSelectionState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value
      return normalizeSelection(next)
    })
  }, [])
  const [logoDescription, setLogoDescription] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [designId, setDesignId] = useState<string | null>(null)
  const [designTitle, setDesignTitle] = useState('Untitled design')
  const [designs, setDesigns] = useState<DesignSummary[]>([])
  const [savingDesign, setSavingDesign] = useState(false)
  const [generated, setGenerated] = useState<GeneratedViews>({})
  const [generating, setGenerating] = useState(false)
  const [generateProgress, setGenerateProgress] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [authOpen, setAuthOpen] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [marketingDraft, setMarketingDraft] = useState<string | null>(null)
  const [guestUsed, setGuestUsed] = useState(() => getGuestGenerationCount())
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ensuredDesignForUser = useRef<string | null>(null)

  const refreshGuest = useCallback(() => {
    setGuestUsed(getGuestGenerationCount())
  }, [])

  const pushToast = useCallback((type: ToastMessage['type'], text: string) => {
    const id = nextToastId()
    setToasts((prev) => [...prev, { id, type, text }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5200)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const patchGenerated = useCallback((patch: Partial<GeneratedViews>) => {
    setGenerated((prev) => mergeGeneratedViews(prev, patch))
  }, [])

  const applyRefinedNotes = useCallback((nextNotes: string) => {
    setUserPrompt(nextNotes.trim())
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    try {
      const p = await fetchProfile(user.id)
      setProfile(p)
      if (p) {
        setUser((u) =>
          u
            ? sessionFromAuth(u.id, u.email, p.display_name || u.name, p.subscription_active)
            : u,
        )
      }
    } catch (e) {
      pushToast('error', e instanceof Error ? e.message : 'Could not load profile.')
    }
  }, [user, pushToast])

  const refreshDesigns = useCallback(async () => {
    if (!user) {
      setDesigns([])
      return
    }
    try {
      const list = await listDesigns(user.id)
      setDesigns(list ?? [])
    } catch (e) {
      pushToast('error', e instanceof Error ? e.message : 'Could not load designs.')
    }
  }, [user, pushToast])

  const hydrateUser = useCallback(
    async (authUser: { id: string; email?: string; user_metadata?: { display_name?: string } }) => {
      const email = authUser.email ?? ''
      let p = await fetchProfile(authUser.id)
      if (!p) {
        await new Promise((r) => setTimeout(r, 800))
        p = await fetchProfile(authUser.id)
      }
      setProfile(p)
      const name =
        p?.display_name ||
        authUser.user_metadata?.display_name ||
        email.split('@')[0] ||
        'Creator'
      setUser(sessionFromAuth(authUser.id, email, name, p?.subscription_active ?? false))
      const needsOnboarding = p && !(p.onboarding_complete ?? Boolean(p.city && p.country))
      setOnboardingOpen(Boolean(needsOnboarding))
    },
    [],
  )

  useEffect(() => {
    const supabase = getSupabase()
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) void hydrateUser(data.session.user)
      setAuthReady(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) void hydrateUser(session.user)
      else {
        setUser(null)
        setProfile(null)
        setDesignId(null)
        setDesigns([])
        setOnboardingOpen(false)
        ensuredDesignForUser.current = null
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [hydrateUser])

  useEffect(() => {
    if (user) void refreshDesigns()
  }, [user, refreshDesigns])

  const saveCurrentDesign = useCallback(async () => {
    if (!user || !designId) return
    setSavingDesign(true)
    try {
      await saveDesign({
        id: designId,
        title: designTitle.trim() || 'Untitled design',
        selection,
        logoDescription,
        userPrompt,
        generated,
      })
      await refreshDesigns()
    } catch (e) {
      pushToast('error', e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setSavingDesign(false)
    }
  }, [
    user,
    designId,
    designTitle,
    selection,
    logoDescription,
    userPrompt,
    generated,
    refreshDesigns,
    pushToast,
  ])

  // Auto-save when logged in
  useEffect(() => {
    if (!user || !designId) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      void saveCurrentDesign()
    }, 2500)
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [user, designId, selection, logoDescription, userPrompt, generated, designTitle, saveCurrentDesign])

  const loadDesignById = useCallback(
    async (id: string) => {
      try {
        const row = await fetchDesign(id)
        setDesignId(row.id)
        setDesignTitle(row.title)
        setSelection(normalizeSelection(row.selection))
        setLogoDescription(row.logo_description ?? '')
        setUserPrompt(row.user_prompt ?? '')
        setGenerated((prev) => {
          for (const u of Object.values(prev)) revokeGeneratedUrl(u)
          return row.generated_views ?? {}
        })
        pushToast('success', 'Design loaded.')
      } catch (e) {
        pushToast('error', e instanceof Error ? e.message : 'Could not load design.')
      }
    },
    [pushToast],
  )

  const startNewDesign = useCallback(async () => {
    if (!user) {
      setAuthOpen(true)
      return
    }
    try {
      ensuredDesignForUser.current = user.id
      const id = await createDesign(user.id, 'New design')
      setDesignId(id)
      setDesignTitle('New design')
      setSelection(DEFAULT_OUTFIT_SELECTION)
      setLogoDescription('')
      setUserPrompt('')
      setGenerated((prev) => {
        for (const u of Object.values(prev)) revokeGeneratedUrl(u)
        return {}
      })
      await refreshDesigns()
      pushToast('success', 'Blank design started.')
    } catch (e) {
      pushToast('error', e instanceof Error ? e.message : 'Could not create design.')
    }
  }, [user, refreshDesigns, pushToast])

  useEffect(() => {
    if (!user || !authReady || designId) return
    if (ensuredDesignForUser.current === user.id) return
    ensuredDesignForUser.current = user.id
    void (async () => {
      try {
        const id = await createDesign(user.id, 'New design')
        setDesignId(id)
        setDesignTitle('New design')
        await refreshDesigns()
      } catch (e) {
        pushToast('error', e instanceof Error ? e.message : 'Could not create design.')
        ensuredDesignForUser.current = null
      }
    })()
  }, [user, authReady, designId, refreshDesigns, pushToast])

  const ensureCanGenerate = useCallback((): boolean => {
    if (user) return true
    if (guestCanGenerate()) return true
    pushToast('error', 'Free trial used up. Sign in to continue.')
    setAuthOpen(true)
    return false
  }, [user, pushToast])

  const runAngle = useCallback(
    async (angle: ViewAngle, chargeGuest: boolean) => {
      const prompt = buildFullPrompt(selection, logoDescription, userPrompt, angle)
      const url = await generateImage(prompt)
      setGenerated((prev) => mergeGeneratedViews(prev, { [angle]: url }))
      if (chargeGuest && !user) {
        incrementGuestGenerationCount()
        refreshGuest()
      }
    },
    [selection, logoDescription, userPrompt, user, refreshGuest],
  )

  const generateOutfitMultiView = useCallback(async () => {
    if (!ensureCanGenerate()) return
    if (selection.meshIds.length === 0) {
      pushToast('error', 'Pick at least one garment.')
      return
    }
    setGenerating(true)
    setGenerateProgress('Generating all views…')
    try {
      const chargeFirstOnly = !user
      for (let i = 0; i < VIEW_ORDER.length; i++) {
        const angle = VIEW_ORDER[i]
        setGenerateProgress(`${angle} view (${i + 1}/${VIEW_ORDER.length})`)
        await runAngle(angle, chargeFirstOnly && i === 0)
      }
      pushToast('success', 'Outfit generated — all views ready.')
      if (user) await saveCurrentDesign()
    } catch (e) {
      pushToast('error', e instanceof Error ? e.message : 'Image generation failed.')
    } finally {
      setGenerating(false)
      setGenerateProgress(null)
    }
  }, [ensureCanGenerate, selection.meshIds.length, runAngle, user, pushToast, saveCurrentDesign])

  const regenerateAngle = useCallback(
    async (angle: ViewAngle) => {
      if (!ensureCanGenerate()) return
      setGenerating(true)
      setGenerateProgress(`Regenerating ${angle}`)
      try {
        await runAngle(angle, !user)
        pushToast('success', 'View updated.')
        if (user) await saveCurrentDesign()
      } catch (e) {
        pushToast('error', e instanceof Error ? e.message : 'Regeneration failed.')
      } finally {
        setGenerating(false)
        setGenerateProgress(null)
      }
    },
    [ensureCanGenerate, runAngle, user, pushToast, saveCurrentDesign],
  )

  const canUseVideo = user ? user.plan === 'premium' || user.plan === 'enterprise' : false
  const canUseMarketing = user?.plan === 'enterprise'

  const generateSocialVideo = useCallback(async () => {
    if (!user) {
      setAuthOpen(true)
      pushToast('info', 'Sign in with Recommended or Enterprise for AI video.')
      return
    }
    if (!canUseVideo) {
      pushToast('error', 'AI video requires Recommended or Enterprise.')
      return
    }
    setGenerating(true)
    setGenerateProgress('Preparing social video (mock)…')
    await new Promise((r) => setTimeout(r, 1600))
    setGenerating(false)
    setGenerateProgress(null)
    pushToast('success', 'Video queued (mock).')
  }, [user, canUseVideo, pushToast])

  const generateMarketingKit = useCallback(async () => {
    if (!user) {
      setAuthOpen(true)
      return
    }
    if (!canUseMarketing) {
      pushToast('error', 'Advanced marketing kit is Enterprise only.')
      return
    }
    setGenerating(true)
    try {
      const brief = buildFullPrompt(selection, logoDescription, userPrompt, 'front')
      const content = await sendChatMessage(
        `You are a fashion creative director. From this outfit direction, write in English: 1) capsule name 2) Instagram bio (80 words max) 3) three post captions 4) five hashtags. Be concrete. Technical context: ${brief.slice(0, 1200)}`,
      )
      setMarketingDraft(content)
      pushToast('success', 'Marketing kit generated.')
    } catch (e) {
      pushToast('error', e instanceof Error ? e.message : 'Marketing kit error.')
    } finally {
      setGenerating(false)
    }
  }, [user, canUseMarketing, selection, logoDescription, userPrompt, pushToast])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await getSupabase().auth.signInWithPassword({ email, password })
      if (error) throw error
      pushToast('success', 'Welcome back!')
      setAuthOpen(false)
    },
    [pushToast],
  )

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const check = await checkSignupAllowed(email)
      if (!check.allowed) {
        throw new Error(check.reason || 'Sign up not allowed from this network.')
      }

      const { error } = await getSupabase().auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      })
      if (error) throw error

      await recordSignupMetadata()
      pushToast('success', 'Account created — 1 free print credit!')
      setAuthOpen(false)
      setOnboardingOpen(true)
    },
    [pushToast],
  )

  const signOut = useCallback(async () => {
    setGenerated((prev) => {
      for (const u of Object.values(prev)) revokeGeneratedUrl(u)
      return {}
    })
    setDesignId(null)
    await getSupabase().auth.signOut()
    setUser(null)
    setProfile(null)
    pushToast('info', 'Signed out.')
  }, [pushToast])

  const updatePlan = useCallback(
    (plan: PlanId) => {
      if (!user) return
      setUser({ ...user, plan })
      pushToast('success', `Plan updated: ${plan}.`)
    },
    [user, pushToast],
  )

  const updateProfileFields = useCallback(
    async (patch: ProfileUpdate) => {
      if (!user) throw new Error('Sign in required')
      const p = await updateProfile(user.id, patch)
      setProfile(p)
      pushToast('success', 'Profile updated.')
    },
    [user, pushToast],
  )

  const completeOnboarding = useCallback(
    async (patch: ProfileUpdate) => {
      if (!user) throw new Error('Sign in required')
      const p = await updateProfile(user.id, { ...patch, onboarding_complete: true })
      setProfile(p)
      if (p.display_name) {
        setUser((u) => (u ? { ...u, name: p.display_name || u.name } : u))
      }
      setOnboardingOpen(false)
      pushToast('success', 'Your account is ready.')
    },
    [user, pushToast],
  )

  const deleteDesignById = useCallback(
    async (id: string) => {
      try {
        await deleteDesign(id)
        if (designId === id) {
          setDesignId(null)
          setDesignTitle('Untitled design')
          setSelection(DEFAULT_OUTFIT_SELECTION)
          setLogoDescription('')
          setUserPrompt('')
          setGenerated((prev) => {
            for (const u of Object.values(prev)) revokeGeneratedUrl(u)
            return {}
          })
        }
        await refreshDesigns()
        pushToast('success', 'Outfit deleted.')
      } catch (e) {
        pushToast('error', e instanceof Error ? e.message : 'Could not delete.')
        throw e
      }
    },
    [designId, refreshDesigns, pushToast],
  )

  const requestSubscription = useCallback(async () => {
    if (!user) throw new Error('Sign in required')
    await notifyPurchaseRequest({
      type: 'subscription',
      userEmail: user.email,
      userName: user.name,
    })
    const url = whatsAppPayUrl(subscriptionPayMessage(user.email, user.name))
    window.open(url, '_blank', 'noopener,noreferrer')
    pushToast('success', 'Check your email — complete payment on WhatsApp.')
  }, [user, pushToast])

  const requestCredits = useCallback(
    async (amount: number) => {
      if (!user) throw new Error('Sign in required')
      await notifyPurchaseRequest({
        type: 'credits',
        creditAmount: amount,
        userEmail: user.email,
        userName: user.name,
      })
      const url = whatsAppPayUrl(creditsPayMessage(user.email, user.name, amount))
      window.open(url, '_blank', 'noopener,noreferrer')
      pushToast('success', 'Check your email — complete payment on WhatsApp.')
    },
    [user, pushToast],
  )

  const value = useMemo<OutGenContextValue>(
    () => ({
      user,
      profile,
      authReady,
      selection,
      setSelection,
      logoDescription,
      setLogoDescription,
      userPrompt,
      setUserPrompt,
      applyRefinedNotes,
      designId,
      designTitle,
      setDesignTitle,
      designs,
      savingDesign,
      saveCurrentDesign,
      loadDesignById,
      startNewDesign,
      refreshDesigns,
      refreshProfile,
      updateProfileFields,
      requestSubscription,
      requestCredits,
      generated,
      patchGenerated,
      generating,
      generateProgress,
      guestUsed,
      guestLimit: 5,
      toasts,
      dismissToast,
      authOpen,
      setAuthOpen,
      onboardingOpen,
      completeOnboarding,
      deleteDesignById,
      signIn,
      signUp,
      signOut,
      updatePlan,
      generateOutfitMultiView,
      regenerateAngle,
      generateSocialVideo,
      generateMarketingKit,
      marketingDraft,
      canUseVideo,
      canUseMarketing,
    }),
    [
      user,
      profile,
      authReady,
      selection,
      logoDescription,
      userPrompt,
      applyRefinedNotes,
      designId,
      designTitle,
      designs,
      savingDesign,
      saveCurrentDesign,
      loadDesignById,
      startNewDesign,
      refreshDesigns,
      refreshProfile,
      updateProfileFields,
      requestSubscription,
      requestCredits,
      generated,
      patchGenerated,
      generating,
      generateProgress,
      guestUsed,
      toasts,
      dismissToast,
      authOpen,
      onboardingOpen,
      completeOnboarding,
      deleteDesignById,
      marketingDraft,
      canUseVideo,
      canUseMarketing,
      signIn,
      signUp,
      signOut,
      updatePlan,
      generateOutfitMultiView,
      regenerateAngle,
      generateSocialVideo,
      generateMarketingKit,
    ],
  )

  return <OutGenContext.Provider value={value}>{children}</OutGenContext.Provider>
}

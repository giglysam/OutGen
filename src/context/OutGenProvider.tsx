import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { GeneratedViews, OutfitSelection, ToastMessage, UserSession, ViewAngle } from '../types'
import { buildFullPrompt, VIEW_ORDER } from '../lib/promptBuilder'
import { generateImage, sendChatMessage } from '../lib/api'
import { guestCanGenerate, getGuestGenerationCount, incrementGuestGenerationCount } from '../lib/guestTrials'
import { mergeGeneratedViews, revokeGeneratedUrl } from '../lib/generatedImageUrl'
import { clearSession, loadSession, mockSignIn, mockSignUp, saveSession } from '../lib/session'
import type { PlanId } from '../lib/constants'
import { OutGenContext, type OutGenContextValue } from './outgen-context'

const defaultSelection: OutfitSelection = {
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

let toastSeq = 0
function nextToastId() {
  toastSeq += 1
  return `t-${toastSeq}`
}

export function OutGenProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => loadSession())
  const [selection, setSelection] = useState<OutfitSelection>(defaultSelection)
  const [logoDescription, setLogoDescription] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [generated, setGenerated] = useState<GeneratedViews>({})
  const [generating, setGenerating] = useState(false)
  const [generateProgress, setGenerateProgress] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [authOpen, setAuthOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [marketingDraft, setMarketingDraft] = useState<string | null>(null)
  const [guestUsed, setGuestUsed] = useState(() => getGuestGenerationCount())

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

  const ensureCanGenerate = useCallback((): boolean => {
    if (user) return true
    if (guestCanGenerate()) return true
    pushToast('error', 'Essai gratuit épuisé (5 générations). Connectez-vous pour continuer.')
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
      pushToast('error', 'Choisis au moins une pièce (grille silhouettes).')
      return
    }
    setGenerating(true)
    setGenerateProgress('Génération multi-vues…')
    try {
      const chargeFirstOnly = !user
      for (let i = 0; i < VIEW_ORDER.length; i++) {
        const angle = VIEW_ORDER[i]
        setGenerateProgress(`Vue ${angle} (${i + 1}/${VIEW_ORDER.length})`)
        await runAngle(angle, chargeFirstOnly && i === 0)
      }
      pushToast('success', 'Tenue générée — toutes les vues sont prêtes.')
    } catch (e) {
      pushToast('error', e instanceof Error ? e.message : 'Erreur de génération image.')
    } finally {
      setGenerating(false)
      setGenerateProgress(null)
    }
  }, [ensureCanGenerate, selection.meshIds.length, runAngle, user, pushToast])

  const regenerateAngle = useCallback(
    async (angle: ViewAngle) => {
      if (!ensureCanGenerate()) return
      setGenerating(true)
      setGenerateProgress(`Régénération ${angle}`)
      try {
        await runAngle(angle, !user)
        pushToast('success', 'Vue mise à jour.')
      } catch (e) {
        pushToast('error', e instanceof Error ? e.message : 'Erreur de régénération.')
      } finally {
        setGenerating(false)
        setGenerateProgress(null)
      }
    },
    [ensureCanGenerate, runAngle, user, pushToast],
  )

  const canUseVideo = user ? user.plan === 'premium' || user.plan === 'enterprise' : false
  const canUseMarketing = user?.plan === 'enterprise'

  const generateSocialVideo = useCallback(async () => {
    if (!user) {
      setAuthOpen(true)
      pushToast('info', 'Connecte-toi avec un plan Recommended ou Enterprise pour la vidéo IA.')
      return
    }
    if (!canUseVideo) {
      pushToast('error', 'La génération vidéo nécessite le plan Recommended ou Enterprise.')
      return
    }
    setGenerating(true)
    setGenerateProgress('Préparation vidéo sociale (mock pipeline)…')
    await new Promise((r) => setTimeout(r, 1600))
    setGenerating(false)
    setGenerateProgress(null)
    pushToast(
      'success',
      'Vidéo mise en file (mock). Branche ton provider vidéo côté API pour la sortie réelle.',
    )
  }, [user, canUseVideo, pushToast])

  const generateMarketingKit = useCallback(async () => {
    if (!user) {
      setAuthOpen(true)
      return
    }
    if (!canUseMarketing) {
      pushToast('error', 'Le kit marketing avancé est réservé au plan Enterprise.')
      return
    }
    setGenerating(true)
    try {
      const brief = buildFullPrompt(selection, logoDescription, userPrompt, 'front')
      const content = await sendChatMessage(
        `Tu es un directeur créatif mode. À partir de cette direction visuelle (tenue), rédige en français : 1) nom de capsule 2) bio Instagram 80 mots max 3) 3 légendes de posts 4) 5 hashtags. Sois concret. Contexte technique: ${brief.slice(0, 1200)}`,
      )
      setMarketingDraft(content)
      pushToast('success', 'Kit marketing généré (texte).')
    } catch (e) {
      pushToast('error', e instanceof Error ? e.message : 'Erreur kit marketing.')
    } finally {
      setGenerating(false)
    }
  }, [user, canUseMarketing, selection, logoDescription, userPrompt, pushToast])

  const signIn = useCallback(
    (email: string, password: string) => {
      const u = mockSignIn(email, password)
      setUser(u)
      pushToast('success', `Bienvenue, ${u.name}.`)
      setAuthOpen(false)
    },
    [pushToast],
  )

  const signUp = useCallback(
    (email: string, password: string, name: string, plan: PlanId) => {
      const u = mockSignUp(email, password, name, plan)
      setUser(u)
      pushToast('success', 'Compte créé (mock).')
      setAuthOpen(false)
    },
    [pushToast],
  )

  const signOut = useCallback(() => {
    setGenerated((prev) => {
      for (const u of Object.values(prev)) revokeGeneratedUrl(u)
      return {}
    })
    clearSession()
    setUser(null)
    pushToast('info', 'Déconnexion.')
  }, [pushToast])

  const updatePlan = useCallback(
    (plan: PlanId) => {
      if (!user) return
      const next = { ...user, plan }
      setUser(next)
      saveSession(next)
      pushToast('success', `Plan mis à jour : ${plan}.`)
    },
    [user, pushToast],
  )

  const value = useMemo<OutGenContextValue>(
    () => ({
      user,
      selection,
      setSelection,
      logoDescription,
      setLogoDescription,
      userPrompt,
      setUserPrompt,
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
      chatOpen,
      setChatOpen,
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
      selection,
      logoDescription,
      userPrompt,
      generated,
      patchGenerated,
      generating,
      generateProgress,
      guestUsed,
      toasts,
      dismissToast,
      authOpen,
      chatOpen,
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

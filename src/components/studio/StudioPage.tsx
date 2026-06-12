import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import {
  COLLAR_ITEMS,
  COLOR_ITEMS,
  CREATIVE_SNIPPETS,
  DETAIL_ITEMS,
  FABRIC_ITEMS,
  FINISH_ITEMS,
  FIT_ITEMS,
  MESH_ITEMS,
  PATTERN_ITEMS,
  SLEEVE_ITEMS,
} from '../../data/promptCatalog'
import { useOutGen } from '../../hooks/useOutGen'
import type { PromptItem } from '../../types'
import { buildFullPrompt, buildGarmentDescription } from '../../lib/promptBuilder'
import { normalizeSelection } from '../../lib/normalizeSelection'
import { selectionChoiceLabels } from '../../lib/selectionLabels'
import { generateImage, refineCreativeNotesWithLlm, sendChatMessage } from '../../lib/api'
import { COLOR_SWATCH } from '../../lib/colorSwatches'
import {
  CollarGlyph,
  DetailGlyph,
  FabricGlyph,
  FinishGlyph,
  FitGlyph,
  MeshFlatIcon,
  PatternGlyph,
  SleeveGlyph,
  type StudioCategory,
} from '../icons/StudioGlyphs'

const MESH_MAX = 4
const LIVE_DEBOUNCE_MS = 1200


type MeshFilter = 'all' | 'tops' | 'bottoms' | 'outer' | 'accessories'

const MESH_FILTER_CHIPS: { id: MeshFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'tops', label: 'Tops' },
  { id: 'outer', label: 'Outerwear' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'accessories', label: 'Accessories' },
]

const CATEGORIES: { id: StudioCategory; label: string }[] = [
  { id: 'pieces', label: 'Clothes' },
  { id: 'coupe', label: 'Fit' },
  { id: 'matiere', label: 'Fabric' },
  { id: 'couleur', label: 'Color' },
  { id: 'col', label: 'Neck' },
  { id: 'manches', label: 'Sleeves' },
  { id: 'motif', label: 'Pattern' },
  { id: 'finition', label: 'Finish' },
  { id: 'details', label: 'Extra' },
  { id: 'texte', label: 'Text' },
]

const LOGO_CHIPS = [
  { label: 'Chest wordmark', text: 'chest wordmark typography, high contrast, perfectly aligned' },
  { label: 'Back graphic', text: 'large centered back graphic print, premium ink' },
  { label: 'Sleeve repeat', text: 'small repeat logo along outer left sleeve' },
  { label: '3D chrome', text: 'chrome 3D metallic logo badge on chest, subtle reflections' },
  { label: 'Embroidery', text: 'dense tonal embroidery crest on chest' },
]

function KeyTile({
  active,
  onClick,
  label,
  subtitle,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`touch-manipulation flex flex-col items-center justify-center gap-0.5 rounded-lg border p-0.5 transition active:scale-[0.96] ${
        subtitle ? 'min-h-[3.25rem]' : 'aspect-square min-h-0'
      } ${
        active
          ? 'border-fuchsia-400/60 bg-gradient-to-b from-fuchsia-500/25 to-violet-600/15 text-white shadow-[0_0_0_1px_rgba(232,121,249,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]'
          : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.07]'
      }`}
    >
      <span className="flex flex-1 items-center justify-center text-zinc-100">{children}</span>
      {subtitle ? (
        <span className="line-clamp-2 w-full px-0.5 text-center text-[7px] font-semibold leading-tight text-zinc-400">
          {subtitle}
        </span>
      ) : null}
    </button>
  )
}

function renderGlyph(cat: StudioCategory, item: PromptItem) {
  switch (cat) {
    case 'pieces':
      return <MeshFlatIcon id={item.id} />
    case 'coupe':
      return <FitGlyph id={item.id} />
    case 'matiere':
      return <FabricGlyph id={item.id} />
    case 'couleur': {
      const hex = COLOR_SWATCH[item.id] || '#525252'
      return (
        <span
          className="block h-8 w-8 rounded-full border-2 border-white/20 shadow-inner sm:h-9 sm:w-9"
          style={{ background: hex }}
        />
      )
    }
    case 'col':
      return <CollarGlyph id={item.id} />
    case 'manches':
      return <SleeveGlyph id={item.id} />
    case 'motif':
      return <PatternGlyph id={item.id} />
    case 'finition':
      return <FinishGlyph id={item.id} />
    case 'details':
      return <DetailGlyph id={item.id} />
    default:
      return null
  }
}

function meshCategoryRank(c?: string): number {
  switch (c) {
    case 'Tops':
      return 0
    case 'Outerwear':
      return 1
    case 'Bottoms':
      return 2
    case 'Accessories':
      return 3
    default:
      return 9
  }
}

export function StudioPage() {
  const [cat, setCat] = useState<StudioCategory>('pieces')
  const [meshFilter, setMeshFilter] = useState<MeshFilter>('all')
  const [liveBusy, setLiveBusy] = useState(false)
  const [dockOpen, setDockOpen] = useState(false)
  const [dockTab, setDockTab] = useState<'choices' | 'chat'>('choices')
  const [chatMode] = useState<'help' | 'design'>('help')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const liveGen = useRef(0)

  const [searchParams] = useSearchParams()
  const designFromUrl = searchParams.get('design')
  const loadingDesignRef = useRef<string | null>(null)

  const {
    user,
    designId,
    designTitle,
    setDesignTitle,
    selection,
    setSelection,
    logoDescription,
    setLogoDescription,
    userPrompt,
    setUserPrompt,
    applyRefinedNotes,
    loadDesignById,
    generateOutfitMultiView,
    generating,
    generated,
    patchGenerated,
    savingDesign,
    saveCurrentDesign,
    livePreviewPaused,
  } = useOutGen()

  const preview = generated.front

  const resetChatIntro = useCallback((mode: 'help' | 'design') => {
    setChatMessages([
      {
        role: 'assistant',
        text:
          mode === 'design'
            ? 'Describe changes (text, graphics, materials). I will refine your creative notes for the image model.'
            : 'Ask about OutGen, plans, or the studio.',
      },
    ])
  }, [])

  useEffect(() => {
    resetChatIntro(chatMode)
  }, [chatMode, resetChatIntro])

  useEffect(() => {
    if (!designFromUrl || !user) return
    if (designId === designFromUrl || loadingDesignRef.current === designFromUrl) return
    loadingDesignRef.current = designFromUrl
    void loadDesignById(designFromUrl).then((row) => {
      if (!row) loadingDesignRef.current = null
      else if (normalizeSelection(row.selection).meshIds.length > 0) {
        setDockOpen(true)
        setDockTab('choices')
        setCat('pieces')
      }
    })
  }, [designFromUrl, user, designId, loadDesignById])

  const filteredMeshItems = useMemo(() => {
    if (meshFilter === 'all') return MESH_ITEMS
    const map: Record<MeshFilter, string | undefined> = {
      all: undefined,
      tops: 'Tops',
      outer: 'Outerwear',
      bottoms: 'Bottoms',
      accessories: 'Accessories',
    }
    const want = map[meshFilter]
    return MESH_ITEMS.filter((m) => m.category === want)
  }, [meshFilter])

  useEffect(() => {
    if (generating) return
    if (livePreviewPaused && generated.front) return
    if (selection.meshIds.length === 0) return

    const id = ++liveGen.current
    const t = window.setTimeout(() => {
      void (async () => {
        setLiveBusy(true)
        try {
          const prompt = buildFullPrompt(selection, logoDescription, userPrompt, 'front')
          const url = await generateImage(prompt)
          if (liveGen.current !== id) return
          patchGenerated({ front: url })
        } catch {
          /* silent preview */
        } finally {
          if (liveGen.current === id) setLiveBusy(false)
        }
      })()
    }, LIVE_DEBOUNCE_MS)

    return () => window.clearTimeout(t)
  }, [selection, logoDescription, userPrompt, generating, patchGenerated, livePreviewPaused, generated.front])

  async function sendDockChat() {
    const q = chatInput.trim()
    if (!q || chatLoading) return
    setChatInput('')
    setChatMessages((m) => [...m, { role: 'user', text: q }])
    setChatLoading(true)
    try {
      if (chatMode === 'design') {
        const garmentSummary = buildGarmentDescription(selection)
        const refined = await refineCreativeNotesWithLlm({
          garmentSummary,
          logoText: logoDescription,
          currentNotes: userPrompt,
          userInstruction: q,
        })
        applyRefinedNotes(refined)
        setChatMessages((m) => [
          ...m,
          { role: 'assistant', text: `Updated creative notes:\n\n${refined}` },
        ])
      } else {
        const reply = await sendChatMessage(
          `Context: OutGen fashion AI studio (multi-view previews, guest trials, plans). Answer in English, concise. User question: ${q}`,
        )
        setChatMessages((m) => [...m, { role: 'assistant', text: reply }])
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed.'
      setChatMessages((m) => [...m, { role: 'assistant', text: msg }])
    } finally {
      setChatLoading(false)
    }
  }

  function toggleMesh(id: string) {
    setSelection((s) => {
      const has = s.meshIds.includes(id)
      if (has) return { ...s, meshIds: s.meshIds.filter((x) => x !== id) }
      if (s.meshIds.length >= MESH_MAX) return s
      return { ...s, meshIds: [...s.meshIds, id] }
    })
  }

  function toggleDetail(id: string) {
    setSelection((s) => {
      const has = s.detailIds.includes(id)
      return {
        ...s,
        detailIds: has ? s.detailIds.filter((x) => x !== id) : [...s.detailIds, id],
      }
    })
  }

  function itemsForCategory(c: StudioCategory): PromptItem[] {
    switch (c) {
      case 'pieces':
        return [...filteredMeshItems].sort(
          (a, b) => meshCategoryRank(a.category) - meshCategoryRank(b.category) || a.label.localeCompare(b.label),
        )
      case 'coupe':
        return FIT_ITEMS
      case 'matiere':
        return FABRIC_ITEMS
      case 'couleur':
        return COLOR_ITEMS
      case 'col':
        return COLLAR_ITEMS
      case 'manches':
        return SLEEVE_ITEMS
      case 'motif':
        return PATTERN_ITEMS
      case 'finition':
        return FINISH_ITEMS
      case 'details':
        return DETAIL_ITEMS
      default:
        return []
    }
  }

  function isActiveItem(c: StudioCategory, item: PromptItem): boolean {
    switch (c) {
      case 'pieces':
        return selection.meshIds.includes(item.id)
      case 'coupe':
        return selection.fitId === item.id
      case 'matiere':
        return selection.fabricId === item.id
      case 'couleur':
        return selection.colorId === item.id
      case 'col':
        return selection.collarId === item.id
      case 'manches':
        return selection.sleeveId === item.id
      case 'motif':
        return selection.patternId === item.id
      case 'finition':
        return selection.finishId === item.id
      case 'details':
        return selection.detailIds.includes(item.id)
      default:
        return false
    }
  }

  function pickItem(c: StudioCategory, item: PromptItem) {
    setSelection((s) => {
      switch (c) {
        case 'coupe':
          return { ...s, fitId: item.id }
        case 'matiere':
          return { ...s, fabricId: item.id }
        case 'couleur':
          return { ...s, colorId: item.id }
        case 'col':
          return { ...s, collarId: item.id }
        case 'manches':
          return { ...s, sleeveId: item.id }
        case 'motif':
          return { ...s, patternId: item.id }
        case 'finition':
          return { ...s, finishId: item.id }
        default:
          return s
      }
    })
  }

  function appendSnippet(snippet: string) {
    setUserPrompt((prev) => {
      const t = prev.trim()
      const s = snippet.trim()
      if (!s) return prev
      if (!t) return s
      if (t.toLowerCase().includes(s.toLowerCase().slice(0, 24))) return t
      return `${t}; ${s}`
    })
  }

  function appendLogoChip(text: string) {
    setLogoDescription((prev) => {
      const t = prev.trim()
      const s = text.trim()
      if (!t) return s
      return `${t}; ${s}`
    })
  }

  const gridItems = itemsForCategory(cat)
  const showClear = cat !== 'pieces' && cat !== 'details' && cat !== 'texte'

  const keysGrid = (
    <>
      {cat === 'texte' ? (
        <div className="space-y-4 p-2">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Branding & text</span>
              <span className="text-[9px] text-zinc-600">{logoDescription.length}/400</span>
            </div>
            <textarea
              className="mt-1.5 min-h-[72px] w-full resize-y rounded-2xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-0 placeholder:text-zinc-600 focus:border-fuchsia-500/50"
              placeholder="Logo, slogan, embroidery, placement (chest, back, sleeve)…"
              value={logoDescription}
              maxLength={400}
              onChange={(e) => setLogoDescription(e.target.value)}
            />
            <div className="kbd-scroll mt-2 flex gap-1.5 overflow-x-auto pb-1">
              {LOGO_CHIPS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => appendLogoChip(c.text)}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-zinc-300 hover:border-fuchsia-500/40 hover:text-white"
                >
                  + {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Creative direction</span>
              <span className="text-[9px] text-zinc-600">{userPrompt.length}/900</span>
            </div>
            <textarea
              className="mt-1.5 min-h-[88px] w-full resize-y rounded-2xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-0 placeholder:text-zinc-600 focus:border-violet-500/50"
              placeholder="Mood, graphics, trims, effects — English works best for the model…"
              value={userPrompt}
              maxLength={900}
              onChange={(e) => setUserPrompt(e.target.value)}
            />
            <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-500">
              Each image uses a fresh server session. Switch to the <span className="font-semibold text-fuchsia-300">AI chat</span> panel below to refine notes.
            </p>
            <NavLink
              to="/visualize"
              className="mt-2 inline-flex rounded-xl border border-white/15 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-zinc-300 hover:border-white/30 hover:text-white"
            >
              All views
            </NavLink>
          </div>

          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Style chips</span>
            <div className="kbd-scroll mt-2 flex max-h-[9.5rem] flex-wrap gap-1.5 overflow-y-auto pr-1">
              {CREATIVE_SNIPPETS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => appendSnippet(s.snippet)}
                  className="rounded-xl border border-white/10 bg-zinc-900/60 px-2.5 py-1.5 text-left text-[10px] font-medium leading-snug text-zinc-300 hover:border-fuchsia-500/35 hover:text-white"
                >
                  + {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 p-1">
          {cat === 'pieces' && (
            <div className="kbd-scroll flex gap-1 overflow-x-auto px-0.5 pb-1">
              {MESH_FILTER_CHIPS.map((chip) => {
                const on = meshFilter === chip.id
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setMeshFilter(chip.id)}
                    className={`touch-manipulation shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition ${
                      on
                        ? 'bg-white text-black shadow-md'
                        : 'border border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                )
              })}
            </div>
          )}
          <div className="grid grid-cols-4 gap-1 sm:grid-cols-5 sm:gap-1.5">
            {showClear && (
              <KeyTile
                active={
                  cat === 'coupe'
                    ? selection.fitId === null
                    : cat === 'matiere'
                      ? selection.fabricId === null
                      : cat === 'couleur'
                        ? selection.colorId === null
                        : cat === 'col'
                          ? selection.collarId === null
                          : cat === 'manches'
                            ? selection.sleeveId === null
                            : cat === 'motif'
                              ? selection.patternId === null
                              : selection.finishId === null
                }
                onClick={() =>
                  setSelection((s) => {
                    switch (cat) {
                      case 'coupe':
                        return { ...s, fitId: null }
                      case 'matiere':
                        return { ...s, fabricId: null }
                      case 'couleur':
                        return { ...s, colorId: null }
                      case 'col':
                        return { ...s, collarId: null }
                      case 'manches':
                        return { ...s, sleeveId: null }
                      case 'motif':
                        return { ...s, patternId: null }
                      case 'finition':
                        return { ...s, finishId: null }
                      default:
                        return s
                    }
                  })
                }
                label="Clear selection"
              >
                <span className="text-base font-light text-zinc-500">—</span>
              </KeyTile>
            )}
            {gridItems.map((item) => (
              <KeyTile
                key={item.id}
                active={isActiveItem(cat, item)}
                onClick={() => {
                  if (cat === 'pieces') toggleMesh(item.id)
                  else if (cat === 'details') toggleDetail(item.id)
                  else pickItem(cat, item)
                }}
                label={item.label}
                subtitle={cat === 'pieces' ? item.label : undefined}
              >
                {renderGlyph(cat, item)}
              </KeyTile>
            ))}
          </div>
          {cat === 'pieces' && (
            <p className="border-t border-white/5 px-2 py-1.5 text-center text-[9px] text-zinc-500">
              Up to {MESH_MAX} pieces · {selection.meshIds.length} selected
            </p>
          )}
        </div>
      )}
    </>
  )

  const choiceLabels = useMemo(() => selectionChoiceLabels(selection), [selection])

  return (
    <div className="flex flex-col gap-3 px-4 pb-2 pt-2">
      {user && (
        <div className="space-y-1 text-center">
          <input
            type="text"
            value={designTitle}
            onChange={(e) => setDesignTitle(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-center text-sm font-semibold text-white"
            aria-label="Outfit name"
          />
          <p className="text-xs text-zinc-500">
            {savingDesign
              ? 'Saving…'
              : designId
                ? 'Saved — tap Save outfit to update'
                : 'Not saved yet — tap Save outfit to keep this'}
          </p>
        </div>
      )}

      {choiceLabels.length > 0 && (
        <div className="kbd-scroll flex gap-1.5 overflow-x-auto pb-0.5">
          {choiceLabels.map((label) => (
            <span
              key={label}
              className="shrink-0 rounded-full border border-violet-500/40 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold text-violet-200"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="relative mx-auto w-full max-w-sm">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 border-zinc-600 bg-zinc-950 shadow-lg">
          {preview ? (
            <img
              src={preview}
              alt="Your outfit"
              className="h-full w-full object-cover object-top"
              decoding="async"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <p className="text-base font-bold text-white">Your outfit</p>
              <p className="mt-2 text-sm text-zinc-400">Tap &quot;Pick clothes&quot; then &quot;Make my outfit&quot;</p>
            </div>
          )}
          {(liveBusy || generating) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/75 text-sm text-white">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={generating || selection.meshIds.length === 0}
        onClick={() => void generateOutfitMultiView()}
        className="w-full rounded-2xl border-2 border-white bg-white py-4 text-base font-bold text-black disabled:opacity-40"
      >
        {generating ? 'Please wait…' : 'Make my outfit'}
      </button>

      {user && (
        <button
          type="button"
          disabled={savingDesign || selection.meshIds.length === 0}
          onClick={() => void saveCurrentDesign()}
          className="w-full rounded-2xl border-2 border-violet-500 bg-violet-600 py-4 text-base font-bold text-white disabled:opacity-40"
        >
          {savingDesign ? 'Saving…' : 'Save outfit'}
        </button>
      )}

      {!dockOpen ? (
        <button
          type="button"
          onClick={() => {
            setDockOpen(true)
            setDockTab('choices')
          }}
          className="w-full rounded-2xl border-2 border-violet-500 bg-violet-600 py-4 text-base font-bold text-white"
        >
          Pick clothes
        </button>
      ) : (
        <div className="rounded-2xl border-2 border-zinc-700 bg-zinc-950">
          <div className="flex gap-1 border-b border-zinc-800 p-2">
            <button
              type="button"
              onClick={() => setDockTab('choices')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold ${
                dockTab === 'choices' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              Clothes
            </button>
            <button
              type="button"
              onClick={() => setDockTab('chat')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold ${
                dockTab === 'chat' ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              Help
            </button>
            <button
              type="button"
              onClick={() => setDockOpen(false)}
              className="rounded-lg border border-zinc-600 px-4 text-sm font-bold text-white"
            >
              Done
            </button>
          </div>

          {dockTab === 'choices' ? (
            <div className="max-h-[min(50vh,360px)] overflow-y-auto">
              <div className="kbd-scroll flex gap-1 overflow-x-auto border-b border-zinc-800 p-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCat(c.id)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${
                      cat === c.id ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="p-2">{keysGrid}</div>
            </div>
          ) : (
            <div className="max-h-[min(40vh,280px)] overflow-y-auto p-2">
              <div className="space-y-1 text-sm">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`rounded-lg px-3 py-2 ${
                      msg.role === 'user' ? 'ml-4 bg-zinc-800' : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  className="min-h-11 flex-1 rounded-xl border border-zinc-700 bg-black px-3 text-sm text-white"
                  placeholder="Ask a question…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void sendDockChat()
                  }}
                />
                <button
                  type="button"
                  disabled={chatLoading}
                  onClick={() => void sendDockChat()}
                  className="rounded-xl border-2 border-white bg-white px-4 text-sm font-bold text-black"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {generated.front && (
        <NavLink
          to="/visualize"
          className="block w-full rounded-2xl border-2 border-zinc-600 py-3 text-center text-sm font-bold text-zinc-200"
        >
          See all sides
        </NavLink>
      )}
    </div>
  )
}

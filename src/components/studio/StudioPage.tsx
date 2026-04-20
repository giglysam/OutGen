import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
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
import { buildFullPrompt } from '../../lib/promptBuilder'
import { generateImage } from '../../lib/api'
import { COLOR_SWATCH } from '../../lib/colorSwatches'
import {
  CategoryTabIcon,
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
  { id: 'outer', label: 'Outer' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'accessories', label: 'Gear' },
]

/** Dock height + safe area — keep preview above fixed keyboard */
const CONTENT_BOTTOM_SAFE =
  'pb-[calc(clamp(18.5rem,52dvh,28rem)+env(safe-area-inset-bottom,0px))]'

const CATEGORIES: { id: StudioCategory; label: string }[] = [
  { id: 'pieces', label: 'Pieces' },
  { id: 'coupe', label: 'Fit' },
  { id: 'matiere', label: 'Fabric' },
  { id: 'couleur', label: 'Color' },
  { id: 'col', label: 'Neck' },
  { id: 'manches', label: 'Sleeves' },
  { id: 'motif', label: 'Pattern' },
  { id: 'finition', label: 'Finish' },
  { id: 'details', label: 'Details' },
  { id: 'texte', label: 'Design+' },
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
      className={`touch-manipulation flex flex-col items-center justify-center gap-0.5 rounded-2xl border p-1 transition active:scale-[0.96] ${
        subtitle ? 'min-h-[4.85rem]' : 'aspect-square min-h-0'
      } ${
        active
          ? 'border-fuchsia-400/60 bg-gradient-to-b from-fuchsia-500/25 to-violet-600/15 text-white shadow-[0_0_0_1px_rgba(232,121,249,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]'
          : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.07]'
      }`}
    >
      <span className="flex flex-1 items-center justify-center text-zinc-100">{children}</span>
      {subtitle ? (
        <span className="line-clamp-2 w-full px-0.5 text-center text-[8px] font-semibold leading-tight text-zinc-400">
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

function categoryLabel(id: StudioCategory): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}

function meshCategoryRank(c?: string): number {
  switch (c) {
    case 'Hauts':
      return 0
    case 'Outerwear':
      return 1
    case 'Bas':
      return 2
    case 'Accessoires':
      return 3
    default:
      return 9
  }
}

export function StudioPage() {
  const [cat, setCat] = useState<StudioCategory>('pieces')
  const [meshFilter, setMeshFilter] = useState<MeshFilter>('all')
  const [liveBusy, setLiveBusy] = useState(false)
  const liveGen = useRef(0)

  const {
    selection,
    setSelection,
    logoDescription,
    setLogoDescription,
    userPrompt,
    setUserPrompt,
    generateOutfitMultiView,
    generating,
    generated,
    patchGenerated,
    setChatOpen,
    setChatMode,
  } = useOutGen()

  const preview = generated.front

  const filteredMeshItems = useMemo(() => {
    if (meshFilter === 'all') return MESH_ITEMS
    const map: Record<MeshFilter, string | undefined> = {
      all: undefined,
      tops: 'Hauts',
      outer: 'Outerwear',
      bottoms: 'Bas',
      accessories: 'Accessoires',
    }
    const want = map[meshFilter]
    return MESH_ITEMS.filter((m) => m.category === want)
  }, [meshFilter])

  useEffect(() => {
    if (generating) return
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
  }, [selection, logoDescription, userPrompt, generating, patchGenerated])

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
              placeholder="Vibe, graphics, trims, special effects — English works best for the model…"
              value={userPrompt}
              maxLength={900}
              onChange={(e) => setUserPrompt(e.target.value)}
            />
            <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-500">
              Each image request uses a fresh server session to reduce rate limits. Tap{' '}
              <span className="font-semibold text-fuchsia-300">Refine with AI</span> to let the LLM rewrite this field.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setChatMode('design')
                  setChatOpen(true)
                }}
                className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg"
              >
                Refine with AI
              </button>
              <NavLink
                to="/visualiser"
                className="rounded-xl border border-white/15 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-zinc-300 hover:border-white/30 hover:text-white"
              >
                All views
              </NavLink>
            </div>
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
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 sm:gap-2">
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

  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-xl">
      <div className={`px-1 pt-1 sm:px-2 ${CONTENT_BOTTOM_SAFE}`}>
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">Outfit lab</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Studio</h1>
          <p className="mx-auto mt-2 max-w-sm text-[11px] leading-relaxed text-zinc-500">
            Build the look with the keyboard, preview updates automatically, then open{' '}
            <NavLink to="/visualiser" className="text-zinc-300 underline decoration-white/20 underline-offset-2">
              Visualiser
            </NavLink>{' '}
            for every angle.
          </p>
        </div>

        <div className="relative mx-auto mt-5 w-[min(92vw,260px)]">
          <div
            className="absolute -inset-[1px] rounded-[1.35rem] bg-gradient-to-br from-fuchsia-500/50 via-violet-500/30 to-cyan-400/25 opacity-90 blur-[1px]"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <div className="relative aspect-[3/4] max-h-[min(420px,52dvh)] w-full sm:max-h-[min(440px,48dvh)]">
              {preview ? (
                <img
                  src={preview}
                  alt="Outfit preview — front view"
                  className="h-full w-full object-cover object-top"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-zinc-900/80 to-black px-5 text-center">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Live preview
                  </span>
                  <p className="text-sm font-medium text-zinc-300">Pick at least one garment</p>
                  <p className="text-[11px] leading-relaxed text-zinc-600">
                    The dock stays fixed so you never lose your place on mobile.
                  </p>
                </div>
              )}
              {(liveBusy || generating) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 text-xs font-medium text-white backdrop-blur-md">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-fuchsia-400" />
                  {generating ? 'Rendering all views…' : 'Refreshing preview…'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-5 w-full max-w-xs space-y-2">
          <button
            type="button"
            disabled={generating || selection.meshIds.length === 0}
            onClick={() => void generateOutfitMultiView()}
            className="w-full rounded-2xl bg-white py-3.5 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_36px_rgba(255,255,255,0.18)] transition hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-40"
          >
            {generating ? 'Generating…' : 'Generate all views'}
          </button>
          <p className="text-center text-[10px] leading-relaxed text-zinc-600">
            High-quality fashion render · Fresh session per request on the server
          </p>
        </div>
      </div>

      <aside
        className="fixed bottom-0 left-0 right-0 z-40 flex h-[clamp(18.5rem,52dvh,28rem)] flex-col border-t border-white/10 bg-[#070708]/95 shadow-[0_-28px_80px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
        style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom, 0px))' }}
        aria-label="Clothing selection keyboard"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent" />

        <div className="mx-auto flex h-full min-h-0 w-full max-w-lg flex-col lg:max-w-xl">
          <div className="flex shrink-0 justify-center py-2">
            <span className="h-1 w-12 rounded-full bg-zinc-600" aria-hidden />
          </div>

          <div className="flex shrink-0 items-end justify-between border-b border-white/5 px-3 pb-2">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-500">Keyboard</p>
              <p className="text-sm font-semibold text-zinc-100">{categoryLabel(cat)}</p>
            </div>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-medium text-zinc-400">
              {cat === 'texte' ? 'Pro' : `${gridItems.length} options`}
            </span>
          </div>

          <div className="shrink-0 border-b border-white/5 bg-black/20 px-2 py-2">
            <div className="kbd-scroll flex gap-1 overflow-x-auto pb-0.5">
              {CATEGORIES.map((c) => {
                const on = cat === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCat(c.id)}
                    className={`touch-manipulation flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-2 py-1.5 transition active:scale-[0.97] ${
                      on
                        ? 'border-fuchsia-400/50 bg-gradient-to-b from-fuchsia-500/20 to-transparent text-white shadow-[inset_0_0_0_1px_rgba(232,121,249,0.25)]'
                        : 'border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-zinc-200'
                    }`}
                  >
                    <span className="scale-90 [&>svg]:text-current">
                      <CategoryTabIcon cat={c.id} />
                    </span>
                    <span className="max-w-[4rem] truncate text-[8px] font-bold uppercase tracking-wide">{c.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="kbd-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-1 pt-1">
            {keysGrid}
          </div>
        </div>
      </aside>
    </div>
  )
}

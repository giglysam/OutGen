import { useEffect, useRef, useState } from 'react'
import {
  COLLAR_ITEMS,
  COLOR_ITEMS,
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
const LIVE_DEBOUNCE_MS = 1000

/** Espace réservé = hauteur du dock + encoche iPhone (aligné sur le panneau fixe) */
const CONTENT_BOTTOM_SAFE =
  'pb-[calc(clamp(17rem,48dvh,26.875rem)+env(safe-area-inset-bottom,0px))]'

const CATEGORIES: { id: StudioCategory; label: string }[] = [
  { id: 'pieces', label: 'Pièces' },
  { id: 'coupe', label: 'Coupe' },
  { id: 'matiere', label: 'Matière' },
  { id: 'couleur', label: 'Couleur' },
  { id: 'col', label: 'Col' },
  { id: 'manches', label: 'Manches' },
  { id: 'motif', label: 'Motif' },
  { id: 'finition', label: 'Finition' },
  { id: 'details', label: 'Détails' },
  { id: 'texte', label: 'Texte' },
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
      className={`touch-manipulation flex flex-col items-center justify-center gap-0.5 rounded-xl border p-1 text-zinc-300 transition active:scale-[0.96] ${
        subtitle ? 'min-h-[4.75rem]' : 'aspect-square min-h-0'
      } ${
        active
          ? 'border-white bg-zinc-700/90 shadow-[0_0_0_1px_rgba(255,255,255,0.5)]'
          : 'border-zinc-700/90 bg-zinc-800/50 hover:border-zinc-500 hover:bg-zinc-800'
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
          className="block h-8 w-8 rounded-full border-2 border-zinc-500 shadow-inner sm:h-9 sm:w-9"
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

export function StudioPage() {
  const [cat, setCat] = useState<StudioCategory>('pieces')
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
  } = useOutGen()

  const preview = generated.front

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
          /* aperçu silencieux */
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
        return MESH_ITEMS
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

  const gridItems = itemsForCategory(cat)
  const showClear = cat !== 'pieces' && cat !== 'details' && cat !== 'texte'

  const keysGrid = (
    <>
      {cat === 'texte' ? (
        <div className="space-y-3 p-1">
          <label className="block text-left">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Logo / branding</span>
            <textarea
              className="mt-1 min-h-[64px] w-full rounded-lg border border-zinc-600 bg-zinc-900 px-2 py-2 text-sm text-white outline-none focus:border-white"
              placeholder="Logo, broderie, typo…"
              value={logoDescription}
              onChange={(e) => setLogoDescription(e.target.value)}
            />
          </label>
          <label className="block text-left">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Notes créatives</span>
            <textarea
              className="mt-1 min-h-[64px] w-full rounded-lg border border-zinc-600 bg-zinc-900 px-2 py-2 text-sm text-white outline-none focus:border-white"
              placeholder="Ambiance, références…"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1.5 p-1 sm:grid-cols-5 sm:gap-2">
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
              label="Aucune sélection"
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
      )}
      {cat === 'pieces' && (
        <p className="border-t border-zinc-800/80 px-2 py-1.5 text-center text-[9px] text-zinc-500">
          Max {MESH_MAX} pièces · {selection.meshIds.length} sélectionnée(s)
        </p>
      )}
    </>
  )

  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-xl">
      {/* ——— Zone scrollable : aperçu + CTA (jamais masquée par le clavier) ——— */}
      <div className={`px-2 pt-1 ${CONTENT_BOTTOM_SAFE}`}>
        <div className="text-center">
          <h1 className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">Studio</h1>
          <p className="mt-1 text-[10px] text-zinc-500">
            Aperçu ci-dessous · <span className="text-zinc-400">Clavier fixe en bas</span> · Puis toutes les vues
          </p>
        </div>

        <div className="relative mx-auto mt-3 h-[min(260px,34dvh)] w-[min(88vw,220px)] overflow-hidden rounded-2xl border border-zinc-600/70 bg-zinc-950 shadow-[0_16px_48px_rgba(0,0,0,0.5)] sm:h-[min(280px,32dvh)] sm:w-[min(260px,85vw)]">
          {preview ? (
            <img
              src={preview}
              alt="Aperçu de la tenue — vue de face"
              className="h-full w-full object-cover object-top"
              decoding="async"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
              <span className="text-xs font-medium text-zinc-500">Aperçu face</span>
              <span className="text-[10px] text-zinc-600">Utilise le clavier en bas pour choisir des pièces</span>
            </div>
          )}
          {(liveBusy || generating) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/65 text-xs font-medium text-white backdrop-blur-sm">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              {generating ? 'Génération des vues…' : 'Mise à jour…'}
            </div>
          )}
        </div>

        <div className="mx-auto mt-4 w-full max-w-xs space-y-2">
          <button
            type="button"
            disabled={generating || selection.meshIds.length === 0}
            onClick={() => void generateOutfitMultiView()}
            className="w-full rounded-2xl bg-white py-3 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_28px_rgba(255,255,255,0.15)] transition hover:bg-zinc-100 disabled:opacity-40"
          >
            {generating ? 'Génération…' : 'Générer toutes les vues'}
          </button>
          <p className="text-center text-[9px] leading-relaxed text-zinc-600">
            Onglet <span className="text-zinc-500">Visualiser</span> pour face, dos et profils.
          </p>
        </div>
      </div>

      {/* ——— Dock clavier : toujours visible, ancré au bas de l’écran ——— */}
      <aside
        className="fixed bottom-0 left-0 right-0 z-40 flex h-[clamp(17rem,48dvh,26.875rem)] flex-col border-t border-zinc-600/50 bg-[#111113]/98 shadow-[0_-20px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl supports-[backdrop-filter]:bg-[#111113]/92"
        style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom, 0px))' }}
        aria-label="Clavier de sélection"
      >
        <div className="mx-auto flex h-full min-h-0 w-full max-w-lg flex-col lg:max-w-xl">
          {/* Poignée visuelle type clavier système */}
          <div className="flex shrink-0 justify-center py-2">
            <span className="h-1 w-10 rounded-full bg-zinc-600" aria-hidden />
          </div>

          <div className="flex shrink-0 items-end justify-between border-b border-zinc-800/90 px-3 pb-2 pt-0">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-500">Clavier</p>
              <p className="text-sm font-semibold text-zinc-200">{categoryLabel(cat)}</p>
            </div>
            <span className="rounded-md bg-zinc-800 px-2 py-1 text-[9px] font-medium text-zinc-500">
              {gridItems.length} options
            </span>
          </div>

          {/* Rangée catégories */}
          <div className="shrink-0 border-b border-zinc-800/60 bg-zinc-950/50 px-2 py-2">
            <div className="flex gap-1 overflow-x-auto kbd-scroll pb-0.5">
              {CATEGORIES.map((c) => {
                const on = cat === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCat(c.id)}
                    className={`touch-manipulation flex shrink-0 flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 transition active:scale-[0.97] ${
                      on
                        ? 'border-white bg-zinc-700 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.35)]'
                        : 'border-zinc-700 bg-zinc-900/80 text-zinc-500 hover:border-zinc-500'
                    }`}
                  >
                    <span className="scale-90 [&>svg]:text-current">
                      <CategoryTabIcon cat={c.id} />
                    </span>
                    <span className="max-w-[3.5rem] truncate text-[8px] font-bold uppercase tracking-wide">
                      {c.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Grille touches — scroll interne garanti */}
          <div className="kbd-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-1 pt-1">
            {keysGrid}
          </div>
        </div>
      </aside>
    </div>
  )
}

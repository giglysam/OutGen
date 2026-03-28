import { useMemo, type ReactNode } from 'react'
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

const MESH_MAX = 4

function groupMeshes() {
  const map = new Map<string, PromptItem[]>()
  for (const m of MESH_ITEMS) {
    const c = m.category || 'Autre'
    if (!map.has(c)) map.set(c, [])
    map.get(c)!.push(m)
  }
  return map
}

function TogglePill({
  active,
  onClick,
  children,
  small,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  small?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border text-left font-medium transition ${
        small ? 'px-2 py-1.5 text-[10px] sm:text-xs' : 'px-3 py-2 text-xs sm:text-sm'
      } ${
        active
          ? 'border-white bg-zinc-800 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.6),0_0_24px_rgba(255,255,255,0.12)]'
          : 'border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
  )
}

function SingleRow({
  title,
  items,
  current,
  onPick,
}: {
  title: string
  items: PromptItem[]
  current: string | null
  onPick: (id: string | null) => void
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{title}</h3>
      <div className="flex flex-wrap gap-2">
        <TogglePill small active={current === null} onClick={() => onPick(null)}>
          —
        </TogglePill>
        {items.map((it) => (
          <TogglePill key={it.id} small active={current === it.id} onClick={() => onPick(it.id)}>
            {it.label}
          </TogglePill>
        ))}
      </div>
    </section>
  )
}

function MultiRow({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string
  items: PromptItem[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => {
          const on = selected.includes(it.id)
          return (
            <TogglePill key={it.id} small active={on} onClick={() => onToggle(it.id)}>
              {it.label}
            </TogglePill>
          )
        })}
      </div>
    </section>
  )
}

export function StudioPage() {
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
  } = useOutGen()

  const meshGroups = useMemo(() => groupMeshes(), [])

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

  const preview = generated.front

  return (
    <div className="grid flex-1 gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Cockpit créatif</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Chaque bouton ajoute une spécification précise au prompt IA. Génère ensuite une série de vues
            (face, dos, profils, plongée, contre-plongée).
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 sm:p-6">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
            Silhouettes & pièces
          </h2>
          <div className="space-y-6">
            {[...meshGroups.entries()].map(([cat, items]) => (
              <div key={cat}>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                  {cat}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {items.map((m) => {
                    const on = selection.meshIds.includes(m.id)
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleMesh(m.id)}
                        className={`flex min-h-[88px] flex-col justify-between rounded-xl border p-3 text-left transition ${
                          on
                            ? 'border-white bg-zinc-800 shadow-[0_0_0_1px_rgba(255,255,255,0.5),0_0_28px_rgba(255,255,255,0.1)]'
                            : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600'
                        }`}
                      >
                        <span className="text-[11px] font-semibold leading-tight text-white">{m.label}</span>
                        {on && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                            Sélectionné
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-zinc-600">Jusqu’à {MESH_MAX} pièces pour superposer la tenue.</p>
        </section>

        <section className="grid gap-6 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 sm:grid-cols-2 sm:p-6">
          <SingleRow
            title="Coupe & volume"
            items={FIT_ITEMS}
            current={selection.fitId}
            onPick={(id) => setSelection((s) => ({ ...s, fitId: id }))}
          />
          <SingleRow
            title="Matière"
            items={FABRIC_ITEMS}
            current={selection.fabricId}
            onPick={(id) => setSelection((s) => ({ ...s, fabricId: id }))}
          />
          <SingleRow
            title="Couleur dominante"
            items={COLOR_ITEMS}
            current={selection.colorId}
            onPick={(id) => setSelection((s) => ({ ...s, colorId: id }))}
          />
          <SingleRow
            title="Col / encolure"
            items={COLLAR_ITEMS}
            current={selection.collarId}
            onPick={(id) => setSelection((s) => ({ ...s, collarId: id }))}
          />
          <SingleRow
            title="Manches"
            items={SLEEVE_ITEMS}
            current={selection.sleeveId}
            onPick={(id) => setSelection((s) => ({ ...s, sleeveId: id }))}
          />
          <SingleRow
            title="Motif"
            items={PATTERN_ITEMS}
            current={selection.patternId}
            onPick={(id) => setSelection((s) => ({ ...s, patternId: id }))}
          />
          <SingleRow
            title="Finition"
            items={FINISH_ITEMS}
            current={selection.finishId}
            onPick={(id) => setSelection((s) => ({ ...s, finishId: id }))}
          />
        </section>

        <MultiRow title="Détails constructifs" items={DETAIL_ITEMS} selected={selection.detailIds} onToggle={toggleDetail} />

        <section className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 sm:p-6">
          <label className="block text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Logo & branding (texte libre)
            </span>
            <textarea
              className="mt-2 min-h-[72px] w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-white"
              placeholder="Ex. logo brodé aigle doré sur la poitrine, typographie serif minimaliste…"
              value={logoDescription}
              onChange={(e) => setLogoDescription(e.target.value)}
            />
          </label>
          <label className="block text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Notes créatives additionnelles
            </span>
            <textarea
              className="mt-2 min-h-[72px] w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-white"
              placeholder="Ambiance, références, contraintes…"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
            />
          </label>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={generating}
            onClick={() => void generateOutfitMultiView()}
            className="rounded-2xl bg-white px-8 py-4 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:bg-zinc-200 disabled:opacity-50"
          >
            {generating ? 'Génération…' : 'Générer la tenue (multi-vues)'}
          </button>
          <p className="max-w-md text-xs text-zinc-500">
            Un clic lance 6 images séquentielles (une par angle). Invité : 5 sessions ; chaque session compte
            pour 1 essai.
          </p>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 h-fit space-y-4">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 px-4 py-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Aperçu face</h2>
          </div>
          <div className="relative aspect-[3/4] bg-zinc-900">
            {preview ? (
              <img src={preview} alt="Aperçu tenue" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-zinc-600">
                <span>Aucune image encore.</span>
                <span className="text-xs">Configure les boutons puis lance la génération.</span>
              </div>
            )}
            {generating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white">
                Génération…
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-zinc-700 p-4 text-xs text-zinc-500">
          <p className="font-semibold text-zinc-400">Rappel</p>
          <p className="mt-2">
            Modifie un critère puis régénère : va dans <strong className="text-zinc-300">Visualiser</strong> pour
            rafraîchir une vue précise.
          </p>
        </div>
      </aside>
    </div>
  )
}

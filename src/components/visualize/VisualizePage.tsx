import { VIEW_LABELS, VIEW_ORDER } from '../../lib/promptBuilder'
import type { ViewAngle } from '../../types'
import { useOutGen } from '../../hooks/useOutGen'

export function VisualizePage() {
  const { generated, regenerateAngle, generating } = useOutGen()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Multi-view visualization</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Each card matches a camera angle defined in the prompt. Regenerate a single view after you tweak a
          detail.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {VIEW_ORDER.map((angle: ViewAngle) => {
          const url = generated[angle]
          return (
            <article
              key={angle}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  {VIEW_LABELS[angle]}
                </span>
                <button
                  type="button"
                  disabled={generating}
                  onClick={() => void regenerateAngle(angle)}
                  className="rounded-lg border border-zinc-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-300 hover:border-white hover:text-white disabled:opacity-40"
                >
                  Regenerate
                </button>
              </div>
              <div className="relative aspect-square bg-zinc-900">
                {url ? (
                  <img src={url} alt={VIEW_LABELS[angle]} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-center text-xs text-zinc-600">
                    Not generated yet — open the studio.
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

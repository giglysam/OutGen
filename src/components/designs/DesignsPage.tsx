import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOutGen } from '../../hooks/useOutGen'
import { productLabel } from '../../lib/credits'
import { selectionChoiceLabels, selectionSummaryLine } from '../../lib/selectionLabels'

export function DesignsPage() {
  const { user, designs, startNewDesign, deleteDesignById, setAuthOpen } = useOutGen()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">My outfits</h1>
        <p className="mt-3 text-zinc-400">Sign in to see your saved outfits.</p>
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          className="mt-8 w-full max-w-xs rounded-2xl border-2 border-violet-500 bg-violet-600 py-4 text-base font-bold text-white"
        >
          Sign in
        </button>
      </div>
    )
  }

  const generated = designs.filter((d) => d.has_generated)
  const drafts = designs.filter((d) => !d.has_generated)

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await deleteDesignById(id)
      if (expandedId === id) setExpandedId(null)
    } finally {
      setDeletingId(null)
    }
  }

  function renderCard(d: (typeof designs)[number], showImage: boolean) {
    const expanded = expandedId === d.id
    const choices = selectionChoiceLabels(d.selection)

    return (
      <li key={d.id} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
        <button
          type="button"
          onClick={() => setExpandedId(expanded ? null : d.id)}
          className="flex w-full gap-3 p-3 text-left"
        >
          {showImage && d.thumbnail_url ? (
            <img
              src={d.thumbnail_url}
              alt={d.title}
              className="h-24 w-20 shrink-0 rounded-xl object-cover bg-zinc-800"
            />
          ) : (
            <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-[10px] text-zinc-500">
              {showImage ? 'No image' : 'Draft'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-white">{d.title}</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {d.print_product ? productLabel(d.print_product) : 'Garment'} ·{' '}
              {new Date(d.updated_at).toLocaleDateString()}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{selectionSummaryLine(d.selection)}</p>
          </div>
        </button>

        {expanded && (
          <div className="border-t border-zinc-800 px-3 pb-3 pt-2">
            {d.thumbnail_url && (
              <img
                src={d.thumbnail_url}
                alt={`${d.title} generated preview`}
                className="mb-3 w-full rounded-xl border border-zinc-700 object-cover"
              />
            )}
            {choices.length > 0 ? (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {choices.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-[10px] text-zinc-300"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mb-3 text-xs text-zinc-500">No garment picks saved yet.</p>
            )}
            {d.logo_description && (
              <p className="mb-3 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">Branding:</span> {d.logo_description}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/?design=${d.id}`}
                className="rounded-lg border-2 border-violet-500 bg-violet-600 px-3 py-1.5 text-xs font-bold text-white"
              >
                Keep editing
              </Link>
              <Link
                to={`/print?design=${d.id}`}
                className="rounded-lg border-2 border-zinc-600 px-3 py-1.5 text-xs font-bold text-white"
              >
                Order print
              </Link>
              <button
                type="button"
                disabled={deletingId === d.id}
                onClick={() => void handleDelete(d.id, d.title)}
                className="rounded-lg border-2 border-red-900/50 px-3 py-1.5 text-xs font-bold text-red-300 disabled:opacity-50"
              >
                {deletingId === d.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </li>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-4 pt-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">My outfits</h1>
        <Link
          to="/"
          onClick={() => startNewDesign()}
          className="rounded-xl border-2 border-white bg-white px-4 py-2 text-sm font-bold text-black"
        >
          New outfit
        </Link>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        {generated.length} generated · {designs.length} total
      </p>

      {designs.length === 0 ? (
        <div className="mt-10 rounded-2xl border-2 border-dashed border-zinc-700 p-8 text-center">
          <p className="text-zinc-400">No outfits yet.</p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-xl border-2 border-violet-500 bg-violet-600 px-6 py-3 font-bold text-white"
          >
            Make my first outfit
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {generated.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-400">Generated history</h2>
              <p className="mt-1 text-xs text-zinc-500">Tap an outfit to see what you picked and edit it.</p>
              <ul className="mt-3 space-y-3">{generated.map((d) => renderCard(d, true))}</ul>
            </section>
          )}

          {drafts.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-400">Drafts</h2>
              <ul className="mt-3 space-y-3">{drafts.map((d) => renderCard(d, false))}</ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

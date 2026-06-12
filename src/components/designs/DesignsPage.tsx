import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOutGen } from '../../hooks/useOutGen'

export function DesignsPage() {
  const { user, designs, loadDesignById, startNewDesign, deleteDesignById, setAuthOpen } = useOutGen()
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await deleteDesignById(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">My outfits</h1>
        <Link
          to="/"
          onClick={() => void startNewDesign()}
          className="rounded-xl border-2 border-white bg-white px-4 py-2 text-sm font-bold text-black"
        >
          New outfit
        </Link>
      </div>
      <p className="mt-1 text-sm text-zinc-500">{designs.length} saved</p>

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
        <ul className="mt-6 space-y-3">
          {designs.map((d) => (
            <li key={d.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3">
              <div className="flex gap-3">
                {d.thumbnail_url ? (
                  <img
                    src={d.thumbnail_url}
                    alt={d.title}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover bg-zinc-800"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-xs text-zinc-500">
                    No image
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{d.title}</p>
                  <p className="text-xs text-zinc-500">{new Date(d.updated_at).toLocaleDateString()}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link
                      to="/"
                      onClick={() => void loadDesignById(d.id)}
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

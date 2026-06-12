import { Link } from 'react-router-dom'
import { useOutGen } from '../../hooks/useOutGen'

export function DesignsPage() {
  const { user, designs, loadDesignById, startNewDesign, setAuthOpen } = useOutGen()

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-white">My designs</h1>
        <p className="mt-3 text-zinc-400">Sign in to save and continue editing your outfits.</p>
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          className="mt-8 w-full max-w-xs rounded-2xl bg-violet-600 py-4 text-base font-semibold text-white"
        >
          Sign in
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-5 pb-28 pt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">My designs</h1>
          <p className="mt-2 text-zinc-400">{designs.length} saved</p>
        </div>
        <Link
          to="/"
          onClick={() => void startNewDesign()}
          className="shrink-0 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white"
        >
          New
        </Link>
      </div>

      {designs.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-zinc-700 p-10 text-center">
          <p className="text-zinc-400">No designs yet. Create one in the studio.</p>
          <Link to="/" className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-zinc-950">
            Open studio
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {designs.map((d) => (
            <li
              key={d.id}
              className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60"
            >
              <div className="flex gap-4 p-4">
                {d.thumbnail_url ? (
                  <img
                    src={d.thumbnail_url}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-2xl object-cover bg-zinc-800"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 text-2xl">
                    👕
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{d.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(d.updated_at).toLocaleDateString()}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to="/"
                      onClick={() => void loadDesignById(d.id)}
                      className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Continue
                    </Link>
                    <Link
                      to={`/print?design=${d.id}`}
                      className="rounded-xl border border-zinc-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Print
                    </Link>
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

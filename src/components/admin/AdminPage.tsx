import { useCallback, useEffect, useState } from 'react'
import { fetchAdminOrders, updateOrderStatus, type AdminOrder } from '../../lib/notifyApi'
import { PRINT_PRODUCTS, PRINT_QUALITIES } from '../../lib/credits'

const ADMIN_KEY_STORAGE = 'outgen_admin_secret'
const STATUSES = ['pending', 'production', 'shipped', 'delivered'] as const

function labelProduct(id: string) {
  return PRINT_PRODUCTS.find((p) => p.id === id)?.label ?? id
}

function labelQuality(id: string) {
  return PRINT_QUALITIES.find((q) => q.id === id)?.label ?? id
}

export function AdminPage() {
  const [secret, setSecret] = useState(() => sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? '')
  const [input, setInput] = useState('')
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (key: string) => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchAdminOrders(key)
      setOrders(list)
      sessionStorage.setItem(ADMIN_KEY_STORAGE, key)
      setSecret(key)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setOrders([])
      sessionStorage.removeItem(ADMIN_KEY_STORAGE)
      setSecret('')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const stored = sessionStorage.getItem(ADMIN_KEY_STORAGE)
    if (stored) void load(stored)
  }, [load])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    await load(input.trim())
  }

  async function changeStatus(orderId: string, status: string) {
    if (!secret) return
    try {
      await updateOrderStatus(secret, orderId, status)
      await load(secret)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    }
  }

  if (!secret || (error && orders.length === 0 && !loading)) {
    return (
      <div className="mx-auto max-w-md px-5 py-16">
        <h1 className="font-display text-3xl font-bold text-white">Admin</h1>
        <p className="mt-2 text-sm text-zinc-400">Enter your admin secret to view print orders.</p>
        {error && (
          <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}
        <form onSubmit={(e) => void handleLogin(e)} className="mt-6 space-y-4">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Admin secret"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-white outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-full rounded-2xl bg-violet-600 py-4 font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Enter'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-5 pb-4 pt-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Orders</h1>
          <p className="mt-1 text-sm text-zinc-500">{orders.length} print orders</p>
        </div>
        <button
          type="button"
          onClick={() => void load(secret)}
          disabled={loading}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <p className="mt-12 text-center text-zinc-500">No orders yet.</p>
      ) : (
        <ul className="mt-8 space-y-5">
          {orders.map((o) => (
            <li key={o.id} className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="flex gap-4">
                {o.designs?.thumbnail_url ? (
                  <img
                    src={o.designs.thumbnail_url}
                    alt=""
                    className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 text-xs text-zinc-500">
                    No image
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">
                    {labelProduct(o.product_type)} × {o.quantity}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {o.designs?.title ?? 'Design'} · {labelQuality(o.quality)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {o.profiles?.display_name ?? 'User'} ({o.profiles?.email})
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    {[o.profiles?.address_line, o.profiles?.city, o.profiles?.country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  <a
                    href={o.maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm text-violet-400 underline"
                  >
                    Open maps →
                  </a>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-800 pt-4">
                <span className="text-xs text-zinc-500">
                  {new Date(o.created_at).toLocaleString()} · {o.credits_total} cr
                </span>
                <select
                  value={o.status}
                  onChange={(e) => void changeStatus(o.id, e.target.value)}
                  className="ml-auto rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

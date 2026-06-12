import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOutGen } from '../../hooks/useOutGen'
import { PRINT_PRODUCTS, PRINT_QUALITIES, PRINT_ETA_DAYS } from '../../lib/credits'
import {
  fetchMyPrintOrders,
  orderStatusIndex,
  orderStatusLabel,
  type UserPrintOrder,
} from '../../lib/ordersApi'

const STEPS = ['pending', 'production', 'shipped', 'delivered'] as const

function labelProduct(id: string) {
  return PRINT_PRODUCTS.find((p) => p.id === id)?.label ?? id
}

function labelQuality(id: string) {
  return PRINT_QUALITIES.find((q) => q.id === id)?.label ?? id
}

export function MyOrdersPage() {
  const { user, setAuthOpen } = useOutGen()
  const [orders, setOrders] = useState<UserPrintOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setOrders(await fetchMyPrintOrders())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) void load()
  }, [user, load])

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Track my prints</h1>
        <p className="mt-3 text-zinc-400">Sign in to see where your orders are.</p>
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          className="mt-8 w-full max-w-xs rounded-2xl border-2 border-violet-500 bg-violet-600 py-4 font-bold text-white"
        >
          Sign in
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-4 pt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Track my prints</h1>
          <p className="mt-1 text-sm text-zinc-500">Status, shipping, and delivery</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-bold text-white"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {loading && orders.length === 0 ? (
        <p className="mt-12 text-center text-zinc-500">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border-2 border-dashed border-zinc-700 p-8 text-center">
          <p className="text-zinc-400">No print orders yet.</p>
          <Link
            to="/print"
            className="mt-5 inline-block rounded-xl border-2 border-violet-500 bg-violet-600 px-6 py-3 font-bold text-white"
          >
            Order a print
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => {
            const step = orderStatusIndex(o.status)
            return (
              <li key={o.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex gap-3">
                  {o.designs?.thumbnail_url ? (
                    <img
                      src={o.designs.thumbnail_url}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-[10px] text-zinc-500">
                      Outfit
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">
                      {o.designs?.title ?? 'Outfit'} · {labelProduct(o.product_type)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {labelQuality(o.quality)} × {o.quantity} · {o.credits_total} credits
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      Ordered {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between gap-1">
                    {STEPS.map((s, i) => (
                      <div key={s} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className={`h-2 w-full rounded-full ${
                            i <= step ? 'bg-violet-500' : 'bg-zinc-800'
                          }`}
                        />
                        <span
                          className={`text-center text-[9px] leading-tight ${
                            i <= step ? 'text-violet-300' : 'text-zinc-600'
                          }`}
                        >
                          {orderStatusLabel(s)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">{orderStatusLabel(o.status)}</p>
                  {o.status !== 'delivered' && (
                    <p className="text-xs text-zinc-500">
                      Est. {PRINT_ETA_DAYS} days from order
                      {o.shipped_at ? ` · Shipped ${new Date(o.shipped_at).toLocaleDateString()}` : ''}
                    </p>
                  )}
                  {o.delivered_at && (
                    <p className="text-xs text-emerald-400">
                      Delivered {new Date(o.delivered_at).toLocaleDateString()}
                    </p>
                  )}
                  {o.status_note && (
                    <p className="mt-2 rounded-lg bg-zinc-950 px-3 py-2 text-xs text-zinc-300">{o.status_note}</p>
                  )}
                  {(o.tracking_number || o.tracking_url) && (
                    <div className="mt-2 text-xs text-zinc-400">
                      {o.tracking_number && <p>Tracking #: {o.tracking_number}</p>}
                      {o.tracking_url && (
                        <a
                          href={o.tracking_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-400 underline"
                        >
                          Track package →
                        </a>
                      )}
                    </div>
                  )}
                  <a
                    href={o.maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs text-violet-400 underline"
                  >
                    Delivery address on map →
                  </a>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

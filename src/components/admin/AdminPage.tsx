import { useCallback, useEffect, useState } from 'react'
import {
  adminExportUrl,
  fetchAdminDesigns,
  fetchAdminOrders,
  fetchAdminStats,
  fetchAdminUsers,
  grantAdminCredits,
  updateOrderStatus,
  type AdminDesign,
  type AdminOrder,
  type AdminStats,
  type AdminUser,
} from '../../lib/adminApi'
import { PRINT_PRODUCTS, PRINT_QUALITIES } from '../../lib/credits'
import { MiniBarChart } from '../ui/MiniBarChart'

const ADMIN_KEY_STORAGE = 'outgen_admin_secret'
const STATUSES = ['pending', 'production', 'shipped', 'delivered'] as const
type Tab = 'dashboard' | 'orders' | 'users' | 'designs' | 'credits' | 'export'

function labelProduct(id: string) {
  return PRINT_PRODUCTS.find((p) => p.id === id)?.label ?? id
}

function labelQuality(id: string) {
  return PRINT_QUALITIES.find((q) => q.id === id)?.label ?? id
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

export function AdminPage() {
  const [secret, setSecret] = useState(() => sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? '')
  const [input, setInput] = useState('')
  const [tab, setTab] = useState<Tab>('dashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [designs, setDesigns] = useState<AdminDesign[]>([])

  const [creditEmail, setCreditEmail] = useState('')
  const [creditAmount, setCreditAmount] = useState('3')
  const [creditReason, setCreditReason] = useState('manual_payment')
  const [creditMsg, setCreditMsg] = useState<string | null>(null)

  const loadAll = useCallback(async (key: string) => {
    setLoading(true)
    setError(null)
    try {
      const [s, o, u, d] = await Promise.all([
        fetchAdminStats(key),
        fetchAdminOrders(key),
        fetchAdminUsers(key),
        fetchAdminDesigns(key),
      ])
      setStats(s)
      setOrders(o)
      setUsers(u)
      setDesigns(d)
      sessionStorage.setItem(ADMIN_KEY_STORAGE, key)
      setSecret(key)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      sessionStorage.removeItem(ADMIN_KEY_STORAGE)
      setSecret('')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const stored = sessionStorage.getItem(ADMIN_KEY_STORAGE)
    if (stored) void loadAll(stored)
  }, [loadAll])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    await loadAll(input.trim())
  }

  async function changeOrder(order: AdminOrder, patch: {
    status?: string
    trackingNumber?: string
    trackingUrl?: string
    statusNote?: string
  }) {
    if (!secret) return
    try {
      await updateOrderStatus(secret, { orderId: order.id, ...patch })
      await loadAll(secret)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    }
  }

  async function handleGrantCredits(e: React.FormEvent) {
    e.preventDefault()
    if (!secret) return
    setCreditMsg(null)
    try {
      const result = await grantAdminCredits(secret, {
        email: creditEmail.trim(),
        amount: Number(creditAmount),
        reason: creditReason.trim() || 'admin_grant',
      })
      setCreditMsg(`Added credits. New balance: ${result.newBalance}`)
      setCreditEmail('')
      await loadAll(secret)
    } catch (e) {
      setCreditMsg(e instanceof Error ? e.message : 'Grant failed')
    }
  }

  if (!secret || (error && !stats && !loading)) {
    return (
      <div className="mx-auto max-w-md px-5 py-16">
        <h1 className="font-display text-3xl font-bold text-white">Admin</h1>
        <p className="mt-2 text-sm text-zinc-400">CRM, orders, credits, and exports.</p>
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

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'orders', label: 'Orders' },
    { id: 'users', label: 'Users' },
    { id: 'designs', label: 'Designs' },
    { id: 'credits', label: 'Credits' },
    { id: 'export', label: 'Export' },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 pb-4 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Admin CRM</h1>
          <p className="text-sm text-zinc-500">OutGen operations</p>
        </div>
        <button
          type="button"
          onClick={() => void loadAll(secret)}
          disabled={loading}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Refresh
        </button>
      </div>

      <div className="kbd-scroll mt-4 flex gap-1 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${
              tab === t.id ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {tab === 'dashboard' && stats && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Users" value={stats.totals.users} />
            <StatCard label="Designs" value={stats.totals.designs} />
            <StatCard label="Orders" value={stats.totals.orders} />
            <StatCard label="Subscribers" value={stats.totals.subscribers} />
            <StatCard label="Credits out" value={stats.totals.creditsInCirculation} />
            <StatCard label="Credits spent" value={stats.totals.creditsSpent} />
            <StatCard label="Signups blocked" value={stats.totals.blockedSignups} />
            <StatCard label="With preview" value={stats.totals.designsWithImage} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <MiniBarChart title="New users (14d)" data={stats.signupsByDay} />
            <MiniBarChart title="New designs (14d)" data={stats.designsByDay} />
            <MiniBarChart title="Print orders (14d)" data={stats.ordersByDay} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Orders by status</p>
              <ul className="mt-3 space-y-2 text-sm">
                {STATUSES.map((s) => (
                  <li key={s} className="flex justify-between text-zinc-300">
                    <span className="capitalize">{s}</span>
                    <span>{stats.ordersByStatus[s] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Top locations</p>
              <ul className="mt-3 space-y-2 text-sm">
                {stats.countries.slice(0, 8).map((c) => (
                  <li key={c.country} className="flex justify-between text-zinc-300">
                    <span>{c.country}</span>
                    <span>{c.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <ul className="mt-6 space-y-4">
          {orders.length === 0 ? (
            <p className="text-center text-zinc-500">No orders yet.</p>
          ) : (
            orders.map((o) => (
              <li key={o.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex gap-3">
                  {o.designs?.thumbnail_url ? (
                    <img src={o.designs.thumbnail_url} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-zinc-800 text-xs text-zinc-500">
                      —
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">
                      {labelProduct(o.product_type)} × {o.quantity}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {o.designs?.title} · {labelQuality(o.quality)}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {o.profiles?.display_name} ({o.profiles?.email})
                    </p>
                    <p className="text-xs text-zinc-600">
                      {[o.profiles?.address_line, o.profiles?.city, o.profiles?.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input
                    placeholder="Tracking number"
                    defaultValue={o.tracking_number ?? ''}
                    onBlur={(e) => {
                      if (e.target.value !== (o.tracking_number ?? '')) {
                        void changeOrder(o, { trackingNumber: e.target.value })
                      }
                    }}
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                  />
                  <input
                    placeholder="Tracking URL"
                    defaultValue={o.tracking_url ?? ''}
                    onBlur={(e) => {
                      if (e.target.value !== (o.tracking_url ?? '')) {
                        void changeOrder(o, { trackingUrl: e.target.value })
                      }
                    }}
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                  />
                </div>
                <textarea
                  placeholder="Status note for customer"
                  defaultValue={o.status_note ?? ''}
                  onBlur={(e) => {
                    if (e.target.value !== (o.status_note ?? '')) {
                      void changeOrder(o, { statusNote: e.target.value })
                    }
                  }}
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                  rows={2}
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-zinc-500">{new Date(o.created_at).toLocaleString()}</span>
                  <select
                    value={o.status}
                    onChange={(e) => void changeOrder(o, { status: e.target.value })}
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
            ))
          )}
        </ul>
      )}

      {tab === 'users' && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Credits</th>
                <th className="px-3 py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-zinc-800/80">
                  <td className="px-3 py-2">
                    <p className="font-medium text-white">{u.display_name ?? '—'}</p>
                    <p className="text-xs text-zinc-500">{u.email}</p>
                    {u.vpn_flag && <p className="text-[10px] text-amber-400">VPN flagged</p>}
                  </td>
                  <td className="px-3 py-2 text-zinc-400">
                    {[u.city, u.country].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-3 py-2 text-zinc-300">{u.credits_balance}</td>
                  <td className="px-3 py-2 text-xs text-zinc-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'designs' && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {designs.map((d) => (
            <li key={d.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3">
              <div className="flex gap-3">
                {d.thumbnail_url ? (
                  <img src={d.thumbnail_url} alt="" className="h-16 w-16 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-800 text-[10px] text-zinc-500">
                    Draft
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{d.title}</p>
                  <p className="text-xs text-zinc-500">{d.profiles?.email}</p>
                  <p className="text-xs text-zinc-600">
                    {[d.profiles?.city, d.profiles?.country].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-[10px] text-zinc-600">{new Date(d.created_at).toLocaleString()}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === 'credits' && (
        <form onSubmit={(e) => void handleGrantCredits(e)} className="mt-6 max-w-md space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="font-semibold text-white">Add credits to account</p>
          <input
            type="email"
            required
            value={creditEmail}
            onChange={(e) => setCreditEmail(e.target.value)}
            placeholder="User email"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-white"
          />
          <input
            type="number"
            min={1}
            max={500}
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-white"
          />
          <input
            value={creditReason}
            onChange={(e) => setCreditReason(e.target.value)}
            placeholder="Reason (e.g. whatsapp_payment)"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-white"
          />
          <button type="submit" className="w-full rounded-xl bg-violet-600 py-3 font-bold text-white">
            Grant credits
          </button>
          {creditMsg && <p className="text-sm text-zinc-400">{creditMsg}</p>}
        </form>
      )}

      {tab === 'export' && (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-zinc-400">Download CSV snapshots for spreadsheets or backup.</p>
          {(['users', 'designs', 'orders', 'signups', 'transactions'] as const).map((view) => (
            <a
              key={view}
              href={adminExportUrl(secret, view)}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 text-sm font-semibold text-white hover:border-violet-500"
            >
              Export {view}
              <span className="text-violet-400">CSV ↓</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOutGen } from '../../hooks/useOutGen'
import {
  EXTRA_CREDIT_PRICE_USD,
  SUBSCRIPTION_CREDITS_PER_MONTH,
  SUBSCRIPTION_PRICE_USD,
} from '../../lib/credits'

export function AccountPage() {
  const { user, profile, setAuthOpen, updateProfileFields, subscribeStudio, buyCredits, refreshProfile } =
    useOutGen()

  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [mapsUrl, setMapsUrl] = useState('')

  useEffect(() => {
    setCity(profile?.city ?? '')
    setCountry(profile?.country ?? '')
    setAddressLine(profile?.address_line ?? '')
    setMapsUrl(profile?.maps_url ?? '')
  }, [profile])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-white">Account</h1>
        <p className="mt-3 text-zinc-400">Sign in to manage location, credits, and prints.</p>
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

  async function saveLocation() {
    setSaving(true)
    setMsg(null)
    try {
      await updateProfileFields({
        city,
        country,
        address_line: addressLine,
        maps_url: mapsUrl,
      })
      setMsg('Location saved.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubscribe() {
    setMsg(null)
    try {
      await subscribeStudio()
      setMsg(`Studio plan active — ${SUBSCRIPTION_CREDITS_PER_MONTH} credits added.`)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not subscribe')
    }
  }

  async function handleBuyCredits() {
    setMsg(null)
    try {
      await buyCredits(1)
      setMsg('1 credit added.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not buy credits')
    }
  }

  return (
    <div className="mx-auto max-w-lg px-5 pb-28 pt-8">
      <h1 className="font-display text-3xl font-bold text-white">Account</h1>
      <p className="mt-2 text-zinc-400">{user.email}</p>

      <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Print credits</p>
        <p className="mt-2 font-display text-4xl font-bold text-white">{profile?.credits_balance ?? 0}</p>
        <p className="mt-1 text-sm text-zinc-400">
          Studio ${SUBSCRIPTION_PRICE_USD}/mo includes {SUBSCRIPTION_CREDITS_PER_MONTH} credits. Extra credits $
          {EXTRA_CREDIT_PRICE_USD} each.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void handleSubscribe()}
            className="w-full rounded-2xl bg-violet-600 py-4 text-base font-semibold text-white"
          >
            Subscribe — ${SUBSCRIPTION_PRICE_USD}/mo
          </button>
          <button
            type="button"
            onClick={() => void handleBuyCredits()}
            className="w-full rounded-2xl border border-zinc-600 py-4 text-base font-semibold text-white"
          >
            Buy 1 credit — ${EXTRA_CREDIT_PRICE_USD}
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Delivery location</p>
        <p className="mt-2 text-sm text-zinc-400">
          Used for physical prints. Paste a Google Maps link to your exact spot.
        </p>
        <div className="mt-4 space-y-4">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-base text-white outline-none focus:border-violet-500"
          />
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-base text-white outline-none focus:border-violet-500"
          />
          <input
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            placeholder="Street / building (optional)"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-base text-white outline-none focus:border-violet-500"
          />
          <input
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="https://maps.google.com/…"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-base text-white outline-none focus:border-violet-500"
          />
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveLocation()}
          className="mt-5 w-full rounded-2xl bg-white py-4 text-base font-semibold text-zinc-950 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save location'}
        </button>
      </section>

      {msg && (
        <p className="mt-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
          {msg}
        </p>
      )}

      <Link
        to="/print"
        className="mt-6 flex w-full items-center justify-center rounded-2xl border border-zinc-700 py-4 text-base font-semibold text-white"
      >
        Order a print →
      </Link>

      <button
        type="button"
        onClick={() => void refreshProfile()}
        className="mt-3 w-full py-2 text-sm text-zinc-500"
      >
        Refresh balance
      </button>
    </div>
  )
}

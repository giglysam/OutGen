import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOutGen } from '../../hooks/useOutGen'
import {
  CREDIT_USD,
  EXTRA_CREDIT_PRICE_USD,
  SUBSCRIPTION_CREDITS_PER_MONTH,
  SUBSCRIPTION_PRICE_USD,
} from '../../lib/credits'
import { LocationCaptureButton } from '../ui/LocationCaptureButton'

export function AccountPage() {
  const { user, profile, setAuthOpen, updateProfileFields, requestSubscription, requestCredits, refreshProfile } =
    useOutGen()

  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [mapsUrl, setMapsUrl] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)

  useEffect(() => {
    setCity(profile?.city ?? '')
    setCountry(profile?.country ?? '')
    setAddressLine(profile?.address_line ?? '')
    setMapsUrl(profile?.maps_url ?? '')
    setLatitude(profile?.latitude ?? null)
    setLongitude(profile?.longitude ?? null)
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
        latitude,
        longitude,
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
      await requestSubscription()
      setMsg('Opening WhatsApp — send the message to complete payment (+961 71 831 770).')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not start subscription')
    }
  }

  async function handleBuyCredits() {
    setMsg(null)
    try {
      await requestCredits(1)
      setMsg('Opening WhatsApp — send the message to complete payment (+961 71 831 770).')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not start purchase')
    }
  }

  return (
    <div className="mx-auto max-w-lg px-5 pb-4 pt-8">
      <h1 className="font-display text-3xl font-bold text-white">Account</h1>
      <p className="mt-2 text-zinc-400">{user.email}</p>

      <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Print credits</p>
        <p className="mt-2 font-display text-4xl font-bold text-white">{profile?.credits_balance ?? 0}</p>
        <p className="mt-1 text-sm text-zinc-400">
          Studio ${SUBSCRIPTION_PRICE_USD}/mo includes {SUBSCRIPTION_CREDITS_PER_MONTH} credits (${CREDIT_USD}{' '}
          each). Prints from ${CREDIT_USD}–$100 by garment type.
        </p>
        <p className="mt-3 text-xs text-zinc-500">
          Tap below — WhatsApp opens with your order message ready to send to +961 71 831 770.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void handleSubscribe()}
            className="w-full rounded-2xl bg-violet-600 py-4 text-base font-semibold text-white"
          >
            Subscribe — ${SUBSCRIPTION_PRICE_USD}/mo via WhatsApp
          </button>
          <button
            type="button"
            onClick={() => void handleBuyCredits()}
            className="w-full rounded-2xl border border-zinc-600 py-4 text-base font-semibold text-white"
          >
            Buy 1 credit — ${EXTRA_CREDIT_PRICE_USD} via WhatsApp
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5">
        <p className="text-sm font-bold text-white">Home address</p>
        <p className="mt-1 text-sm text-zinc-400">For print delivery.</p>
        <LocationCaptureButton
          className="mt-4"
          onCaptured={(loc) => {
            setMapsUrl(loc.mapsUrl)
            setLatitude(loc.latitude)
            setLongitude(loc.longitude)
            setAddressLine(loc.addressLine)
            setCity(loc.city)
            setCountry(loc.country)
          }}
        />
        {(addressLine || city) && (
          <p className="mt-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
            {[addressLine, city, country].filter(Boolean).join(', ')}
          </p>
        )}
        <button
          type="button"
          disabled={saving || !mapsUrl}
          onClick={() => void saveLocation()}
          className="mt-4 w-full rounded-2xl border-2 border-white bg-white py-4 font-bold text-zinc-950 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save home address'}
        </button>
      </section>

      {msg && (
        <p className="mt-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
          {msg}
        </p>
      )}

      <Link
        to="/help"
        className="mt-6 flex w-full items-center justify-center rounded-2xl border border-violet-500/40 bg-violet-500/10 py-4 text-base font-semibold text-violet-100"
      >
        How to use OutGen (video) →
      </Link>

      <Link
        to="/orders"
        className="mt-3 flex w-full items-center justify-center rounded-2xl border border-zinc-700 py-4 text-base font-semibold text-white"
      >
        Track my prints →
      </Link>

      <Link
        to="/print"
        className="mt-3 flex w-full items-center justify-center rounded-2xl border border-zinc-700 py-4 text-base font-semibold text-white"
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

import { useState } from 'react'
import { useOutGen } from '../../hooks/useOutGen'
import { LocationCaptureButton } from '../ui/LocationCaptureButton'
import { isValidDeliveryLocation } from '../../lib/location'

export function OnboardingModal() {
  const { user, profile, onboardingOpen, completeOnboarding } = useOutGen()
  const [step, setStep] = useState(1)
  const [name, setName] = useState(profile?.display_name ?? user?.name ?? '')
  const [city, setCity] = useState(profile?.city ?? '')
  const [country, setCountry] = useState(profile?.country ?? '')
  const [addressLine, setAddressLine] = useState(profile?.address_line ?? '')
  const [mapsUrl, setMapsUrl] = useState(profile?.maps_url ?? '')
  const [latitude, setLatitude] = useState<number | null>(profile?.latitude ?? null)
  const [longitude, setLongitude] = useState<number | null>(profile?.longitude ?? null)
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!onboardingOpen || !user) return null

  async function handleContinue() {
    setError(null)
    if (step === 1) {
      if (!name.trim()) {
        setError('Please enter your name.')
        return
      }
      setStep(2)
      return
    }
    if (step === 2) {
      if (!mapsUrl.trim() || !isValidDeliveryLocation(mapsUrl)) {
        setError('Tap "Get my location live" so we know where to ship.')
        return
      }
      setStep(3)
      return
    }
    setBusy(true)
    try {
      await completeOnboarding({
        display_name: name.trim(),
        city: city.trim() || null,
        country: country.trim() || null,
        address_line: addressLine.trim() || null,
        maps_url: mapsUrl.trim(),
        latitude,
        longitude,
        phone: phone.trim() || null,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl border border-zinc-800 bg-zinc-950 p-6 sm:rounded-3xl">
        <p className="text-sm font-medium text-violet-400">Step {step} of 3</p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          {step === 1 && 'What is your name?'}
          {step === 2 && 'Your home address'}
          {step === 3 && 'Phone (optional)'}
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {step === 1 && 'We print and ship to you.'}
          {step === 2 && 'Tap the button — no typing needed.'}
          {step === 3 && 'So we can call if delivery needs help.'}
        </p>

        {error && (
          <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {step === 1 && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-2xl border-2 border-zinc-600 bg-zinc-900 px-4 py-4 text-lg text-white outline-none focus:border-violet-500"
            />
          )}

          {step === 2 && (
            <>
              <LocationCaptureButton
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
                <p className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
                  {[addressLine, city, country].filter(Boolean).join(', ')}
                </p>
              )}
            </>
          )}

          {step === 3 && (
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              type="tel"
              className="w-full rounded-2xl border-2 border-zinc-600 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-violet-500"
            />
          )}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void handleContinue()}
          className="mt-8 w-full rounded-2xl border-2 border-violet-500 bg-violet-600 py-4 text-lg font-bold text-white disabled:opacity-50"
        >
          {busy ? 'Saving…' : step === 3 ? 'Save and start' : 'Continue'}
        </button>

        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="mt-3 w-full py-2 text-sm text-zinc-500"
          >
            Go back
          </button>
        )}
      </div>
    </div>
  )
}

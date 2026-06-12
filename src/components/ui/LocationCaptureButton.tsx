import { useState } from 'react'
import { captureLiveLocation, type CapturedLocation } from '../../lib/location'

type Props = {
  onCaptured: (loc: CapturedLocation) => void
  className?: string
}

export function LocationCaptureButton({ onCaptured, className }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGrab() {
    setError(null)
    setBusy(true)
    try {
      const loc = await captureLiveLocation()
      onCaptured(loc)
    } catch (e) {
      if (e instanceof GeolocationPositionError) {
        if (e.code === e.PERMISSION_DENIED) {
          setError('Please allow location access in your phone settings, then try again.')
        } else {
          setError('Could not get your location. Try again outdoors or near a window.')
        }
      } else {
        setError(e instanceof Error ? e.message : 'Location failed')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleGrab()}
        className="w-full rounded-2xl border-2 border-violet-500 bg-violet-600 py-4 text-base font-bold text-white shadow-md disabled:opacity-50"
      >
        {busy ? 'Getting your location…' : 'Get my location live'}
      </button>
      {error && (
        <p className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
    </div>
  )
}

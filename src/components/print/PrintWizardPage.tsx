import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useOutGen } from '../../hooks/useOutGen'
import {
  EXTRA_CREDIT_PRICE_USD,
  PRINT_ETA_DAYS,
  PRINT_PRODUCTS,
  PRINT_QUALITIES,
  type PrintProductId,
  type PrintQualityId,
  totalPrintCredits,
} from '../../lib/credits'
import { placePrintOrder } from '../../lib/profileApi'
import { notifyPrintOrder } from '../../lib/notifyApi'

type Step = 1 | 2 | 3 | 4

export function PrintWizardPage() {
  const { user, profile, designs, setAuthOpen, refreshProfile } = useOutGen()
  const userName = user?.name ?? ''
  const userEmail = user?.email ?? ''
  const [searchParams] = useSearchParams()
  const preselected = searchParams.get('design')

  const [step, setStep] = useState<Step>(1)
  const [designId, setDesignId] = useState<string | null>(preselected)
  const [product, setProduct] = useState<PrintProductId>('tee')
  const [quality, setQuality] = useState<PrintQualityId>('light_cotton')
  const [quantity, setQuantity] = useState(1)
  const [mapsUrl, setMapsUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const creditsNeeded = useMemo(
    () => totalPrintCredits(product, quality, quantity),
    [product, quality, quantity],
  )
  const balance = profile?.credits_balance ?? 0
  const selectedDesign = designs.find((d) => d.id === designId)

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-white">Print your design</h1>
        <p className="mt-3 text-zinc-400">Sign in to order a physical garment shipped to you.</p>
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

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <div className="text-5xl">✓</div>
        <h1 className="mt-4 font-display text-3xl font-bold text-white">Order placed</h1>
        <p className="mt-3 text-zinc-400">
          Production takes about {PRINT_ETA_DAYS} days, then we ship to your location.
        </p>
        <Link to="/designs" className="mt-8 inline-block rounded-2xl bg-white px-8 py-4 font-semibold text-zinc-950">
          Back to designs
        </Link>
      </div>
    )
  }

  async function handleContinue() {
    setError(null)
    if (step === 1) {
      if (!designId) {
        setError('Pick a design to continue.')
        return
      }
      setStep(2)
      return
    }
    if (step === 2) {
      setStep(3)
      if (!mapsUrl && profile?.maps_url) setMapsUrl(profile.maps_url)
      return
    }
    if (step === 3) {
      if (!mapsUrl.trim().includes('google') && !mapsUrl.trim().includes('goo.gl')) {
        setError('Paste a valid Google Maps link.')
        return
      }
      setStep(4)
      return
    }
    if (balance < creditsNeeded) {
      setError(`You need ${creditsNeeded} credits (${balance} available). Buy more in Account.`)
      return
    }
    setBusy(true)
    try {
      const orderId = await placePrintOrder({
        designId: designId!,
        productType: product,
        quality,
        quantity,
        mapsUrl: mapsUrl.trim(),
      })
      try {
        await notifyPrintOrder({
          orderId,
          designTitle: selectedDesign?.title ?? 'Design',
          thumbnailUrl: selectedDesign?.thumbnail_url ?? null,
          productLabel: PRINT_PRODUCTS.find((p) => p.id === product)?.label ?? product,
          qualityLabel: PRINT_QUALITIES.find((q) => q.id === quality)?.label ?? quality,
          quantity,
          creditsTotal: creditsNeeded,
          mapsUrl: mapsUrl.trim(),
          userName,
          userEmail,
          city: profile?.city,
          country: profile?.country,
          addressLine: profile?.address_line,
        })
      } catch {
        /* order saved even if email fails */
      }
      await refreshProfile()
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not place order')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-5 pb-32 pt-8">
      <p className="text-xs font-medium uppercase tracking-wide text-violet-400">Step {step} of 4</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">
        {step === 1 && 'Choose design'}
        {step === 2 && 'Product & quality'}
        {step === 3 && 'Delivery location'}
        {step === 4 && 'Confirm order'}
      </h1>
      <p className="mt-2 text-zinc-400">
        {balance} credit{balance === 1 ? '' : 's'} available · extra credits ${EXTRA_CREDIT_PRICE_USD} each
      </p>

      {error && (
        <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="mt-8 space-y-4">
        {step === 1 && (
          <>
            {designs.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
                No saved designs yet.{' '}
                <Link to="/" className="text-violet-400 underline">
                  Create one in Studio
                </Link>
              </p>
            ) : (
              designs.map((d) => {
                const on = designId === d.id
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDesignId(d.id)}
                    className={`flex w-full items-center gap-4 rounded-3xl border p-4 text-left transition ${
                      on ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-800 bg-zinc-900/50'
                    }`}
                  >
                    {d.thumbnail_url ? (
                      <img src={d.thumbnail_url} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-[10px] text-zinc-500">No image</div>
                    )}
                    <span className="font-semibold text-white">{d.title}</span>
                  </button>
                )
              })
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-3">
              <p className="text-sm text-zinc-500">Product</p>
              {PRINT_PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProduct(p.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left ${
                    product === p.id ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-800'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-white">{p.label}</p>
                    <p className="text-sm text-zinc-500">{p.description}</p>
                  </div>
                  <span className="text-sm font-bold text-violet-300">{p.baseCredits} cr</span>
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-4">
              <p className="text-sm text-zinc-500">Fabric quality</p>
              {PRINT_QUALITIES.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQuality(q.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left ${
                    quality === q.id ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-800'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-white">{q.label}</p>
                    <p className="text-sm text-zinc-500">{q.description}</p>
                  </div>
                  {q.extraCredits > 0 && (
                    <span className="text-sm text-zinc-400">+{q.extraCredits} cr</span>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-4">
              <p className="text-sm text-zinc-500">Copies</p>
              <div className="mt-3 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-700 text-2xl"
                >
                  −
                </button>
                <span className="font-display text-4xl font-bold text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-700 text-2xl"
                >
                  +
                </button>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm text-zinc-400">
              Paste the Google Maps link for your exact delivery spot. You can save a default in{' '}
              <Link to="/account" className="text-violet-400 underline">
                Account
              </Link>
              .
            </p>
            <input
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/…"
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-base text-white outline-none focus:border-violet-500"
            />
          </>
        )}

        {step === 4 && selectedDesign && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <div className="flex gap-4">
              {selectedDesign.thumbnail_url && (
                <img
                  src={selectedDesign.thumbnail_url}
                  alt=""
                  className="h-20 w-20 rounded-2xl object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-white">{selectedDesign.title}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {PRINT_PRODUCTS.find((p) => p.id === product)?.label} × {quantity} ·{' '}
                  {PRINT_QUALITIES.find((q) => q.id === quality)?.label}
                </p>
              </div>
            </div>
            <div className="border-t border-zinc-800 pt-4 text-sm text-zinc-400">
              <p>ETA: ~{PRINT_ETA_DAYS} days production + shipping</p>
              <p className="mt-2 truncate">Ship to: {mapsUrl}</p>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-violet-500/10 px-4 py-3">
              <span className="font-medium text-white">Total</span>
              <span className="font-display text-2xl font-bold text-violet-200">
                {creditsNeeded} credit{creditsNeeded === 1 ? '' : 's'}
              </span>
            </div>
            {balance < creditsNeeded && (
              <Link to="/account" className="block text-center text-sm text-amber-300 underline">
                Need more credits? Go to Account
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-[#060607]/95 p-4 backdrop-blur-xl"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-lg gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="rounded-2xl border border-zinc-700 px-6 py-4 font-semibold text-white"
            >
              Back
            </button>
          )}
          <button
            type="button"
            disabled={busy || (step === 1 && designs.length === 0)}
            onClick={() => void handleContinue()}
            className="flex-1 rounded-2xl bg-violet-600 py-4 text-base font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Placing order…' : step === 4 ? 'Place order' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useOutGen } from '../../hooks/useOutGen'
import { LocationCaptureButton } from '../ui/LocationCaptureButton'
import {
  CREDIT_USD,
  EXTRA_CREDIT_PRICE_USD,
  PRINT_ETA_DAYS,
  PRINT_PRODUCTS,
  PRINT_QUALITIES,
  productLabel,
  type PrintProductId,
  type PrintQualityId,
  totalPrintCredits,
  usdEstimate,
} from '../../lib/credits'
import { fetchDesign } from '../../lib/designsApi'
import { inferPrintProduct } from '../../lib/designCategory'
import { isValidDeliveryLocation } from '../../lib/location'
import { placePrintOrder } from '../../lib/profileApi'
import { notifyPrintOrder } from '../../lib/notifyApi'

type Step = 1 | 2 | 3

export function PrintWizardPage() {
  const { user, profile, designs, setAuthOpen, refreshProfile, updateProfileFields } = useOutGen()
  const userName = user?.name ?? ''
  const userEmail = user?.email ?? ''
  const [searchParams] = useSearchParams()
  const preselected = searchParams.get('design')

  const [step, setStep] = useState<Step>(1)
  const [designId, setDesignId] = useState<string | null>(preselected)
  const [product, setProduct] = useState<PrintProductId>('tee')
  const [quality, setQuality] = useState<PrintQualityId>('light_cotton')
  const [quantity, setQuantity] = useState(1)
  const [mapsUrl, setMapsUrl] = useState(profile?.maps_url ?? '')
  const [addressPreview, setAddressPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const creditsNeeded = useMemo(
    () => totalPrintCredits(product, quality, quantity),
    [product, quality, quantity],
  )
  const usdTotal = useMemo(() => usdEstimate(product, quality, quantity), [product, quality, quantity])
  const balance = profile?.credits_balance ?? 0
  const selectedDesign = designs.find((d) => d.id === designId)

  useEffect(() => {
    if (!designId) return
    void (async () => {
      try {
        const row = await fetchDesign(designId)
        setProduct(row.print_product ?? inferPrintProduct(row.selection))
      } catch {
        if (selectedDesign?.print_product) setProduct(selectedDesign.print_product)
      }
    })()
  }, [designId, selectedDesign?.print_product])

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Order a print</h1>
        <p className="mt-3 text-zinc-400">Sign in to print your outfit at home.</p>
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

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Order sent</h1>
        <p className="mt-3 text-zinc-400">About {PRINT_ETA_DAYS} days until it ships to you.</p>
        <Link to="/designs" className="mt-8 inline-block rounded-2xl border-2 border-white bg-white px-8 py-4 font-bold text-zinc-950">
          Back to my outfits
        </Link>
      </div>
    )
  }

  async function handleContinue() {
    setError(null)
    if (step === 1) {
      if (!designId) {
        setError('Tap an outfit to continue.')
        return
      }
      setStep(2)
      return
    }
    if (step === 2) {
      if (!mapsUrl.trim() || !isValidDeliveryLocation(mapsUrl)) {
        setError('Tap "Get my location live" to set your home address.')
        return
      }
      setStep(3)
      return
    }
    if (balance < creditsNeeded) {
      setError(`You need ${creditsNeeded} credits ($${usdTotal}). You have ${balance}. Buy more in Account.`)
      return
    }
    setBusy(true)
    try {
      await updateProfileFields({
        maps_url: mapsUrl.trim(),
        address_line: addressPreview || profile?.address_line,
      })
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
          designTitle: selectedDesign?.title ?? 'Outfit',
          thumbnailUrl: selectedDesign?.thumbnail_url ?? null,
          productLabel: productLabel(product),
          qualityLabel: PRINT_QUALITIES.find((q) => q.id === quality)?.label ?? quality,
          quantity,
          creditsTotal: creditsNeeded,
          mapsUrl: mapsUrl.trim(),
          userName,
          userEmail,
          city: profile?.city,
          country: profile?.country,
          addressLine: addressPreview || profile?.address_line,
        })
      } catch {
        /* ok */
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
    <div className="mx-auto max-w-lg px-4 pb-4 pt-6">
      <p className="text-sm text-violet-400">Step {step} of 3</p>
      <h1 className="mt-1 text-2xl font-bold text-white">
        {step === 1 && 'Pick your outfit'}
        {step === 2 && 'Where to deliver'}
        {step === 3 && 'Check and send order'}
      </h1>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-4">
        {step === 1 && (
          <>
            {designs.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
                No outfits yet.{' '}
                <Link to="/" className="text-violet-400 underline">
                  Make one first
                </Link>
              </p>
            ) : (
              designs.map((d) => {
                const on = designId === d.id
                const typeLabel = d.print_product ? productLabel(d.print_product) : 'Garment'
                const baseCr = d.print_product
                  ? PRINT_PRODUCTS.find((p) => p.id === d.print_product)?.baseCredits
                  : 1
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDesignId(d.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left ${
                      on ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-800'
                    }`}
                  >
                    {d.thumbnail_url ? (
                      <img src={d.thumbnail_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800 text-[10px] text-zinc-500">
                        No image
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">{d.title}</p>
                      <p className="text-xs text-zinc-500">
                        {typeLabel} · from {baseCr} credits (${(baseCr ?? 1) * CREDIT_USD})
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-zinc-400">We ship to your home. One tap is enough.</p>
            <LocationCaptureButton
              onCaptured={(loc) => {
                setMapsUrl(loc.mapsUrl)
                setAddressPreview([loc.addressLine, loc.city, loc.country].filter(Boolean).join(', '))
              }}
            />
            {addressPreview && (
              <p className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
                Home: {addressPreview}
              </p>
            )}
          </>
        )}

        {step === 3 && selectedDesign && (
          <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex gap-3">
              {selectedDesign.thumbnail_url && (
                <img src={selectedDesign.thumbnail_url} alt="" className="h-16 w-16 rounded-xl object-cover" />
              )}
              <div>
                <p className="font-semibold text-white">{selectedDesign.title}</p>
                <p className="text-sm text-zinc-400">
                  {productLabel(product)} × {quantity}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-white">Fabric</p>
              {PRINT_QUALITIES.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQuality(q.id)}
                  className={`flex w-full items-center justify-between rounded-xl border-2 px-3 py-3 text-left ${
                    quality === q.id ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-700'
                  }`}
                >
                  <span className="text-sm text-white">{q.label}</span>
                  <span className="text-xs text-zinc-400">
                    {q.extraUsd > 0 ? `+$${q.extraUsd}` : 'Included'}
                  </span>
                </button>
              ))}
            </div>

            <div>
              <p className="text-sm font-semibold text-white">How many copies?</p>
              <div className="mt-2 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-zinc-600 text-xl font-bold"
                >
                  −
                </button>
                <span className="text-3xl font-bold text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-zinc-600 text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-violet-500/10 px-4 py-3">
              <p className="text-sm text-zinc-300">
                Ship to: {addressPreview || 'Your saved home address'}
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                {creditsNeeded} credits · about ${usdTotal}
              </p>
              <p className="text-xs text-zinc-500">
                {balance} credits available · extra credits ${EXTRA_CREDIT_PRICE_USD} each (${CREDIT_USD} value)
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        className="sticky z-40 -mx-4 mt-6 border-t border-zinc-800 bg-[#060607]/95 px-4 py-4 backdrop-blur-xl"
        style={{ bottom: 'var(--app-nav-height)' }}
      >
        <div className="flex gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="shrink-0 rounded-xl border-2 border-zinc-600 px-5 py-3 font-bold text-white"
            >
              Back
            </button>
          )}
          <button
            type="button"
            disabled={busy || (step === 1 && designs.length === 0)}
            onClick={() => void handleContinue()}
            className="min-w-0 flex-1 rounded-xl border-2 border-violet-500 bg-violet-600 py-3 font-bold text-white disabled:opacity-50"
          >
            {busy ? 'Sending…' : step === 3 ? 'Send my order' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

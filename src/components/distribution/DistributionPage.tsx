import { useOutGen } from '../../hooks/useOutGen'
import type { PlanId } from '../../lib/constants'
import { PLAN_LABELS } from '../../lib/constants'

const plans: {
  id: PlanId
  price: string
  tag?: string
  bullets: string[]
}[] = [
  {
    id: 'classic',
    price: '$15 / month',
    bullets: [
      'Unlimited image generation on the product side — configure API quotas in production.',
      'Full studio plus multi-view visualization.',
      'Basic trend stats (mock module until real data).',
      'Marketplace: limited listings (few SKUs / month in prod).',
    ],
  },
  {
    id: 'premium',
    price: '$45 / month',
    tag: 'Recommended',
    bullets: [
      'Everything in Classic.',
      'AI videos for social and site (pipeline to connect).',
      'Advanced analytics, auto marketing kit (captions, bios — chat AI here).',
      'Unlimited marketplace plus influencer queue (mock).',
      'Priority support.',
    ],
  },
  {
    id: 'enterprise',
    price: 'Custom',
    tag: 'Enterprise',
    bullets: [
      'Everything in Recommended.',
      'Images, videos, and advanced marketing animations (unlimited on paper).',
      'Dedicated AI models, API integrations, SLA.',
      'Full branding and export animations (mock to real provider).',
    ],
  },
]

export function DistributionPage() {
  const {
    user,
    updatePlan,
    generateSocialVideo,
    generateMarketingKit,
    marketingDraft,
    generating,
    canUseVideo,
    canUseMarketing,
    setAuthOpen,
  } = useOutGen()

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Distribution & plans</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Compare tiers, simulate a plan change (local mock), and prepare videos or marketing kits according to your
          tier.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((p) => {
          const active = user?.plan === p.id
          return (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                p.id === 'premium'
                  ? 'border-white bg-zinc-900 shadow-[0_0_0_1px_rgba(255,255,255,0.4),0_0_48px_rgba(255,255,255,0.08)]'
                  : 'border-zinc-800 bg-zinc-950/80'
              }`}
            >
              {p.tag && (
                <span className="absolute -top-3 left-4 rounded-full bg-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">
                  {p.tag}
                </span>
              )}
              <h2 className="font-display text-xl font-bold text-white">{PLAN_LABELS[p.id]}</h2>
              <p className="mt-2 text-2xl font-semibold text-zinc-200">{p.price}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-zinc-400">
                {p.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              {user ? (
                <button
                  type="button"
                  disabled={active}
                  onClick={() => updatePlan(p.id)}
                  className="mt-8 w-full rounded-xl border border-zinc-600 py-3 text-sm font-bold uppercase tracking-wide text-white hover:border-white disabled:cursor-default disabled:opacity-40"
                >
                  {active ? 'Current plan' : 'Choose (demo)'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="mt-8 w-full rounded-xl bg-white py-3 text-sm font-bold uppercase tracking-wide text-black hover:bg-zinc-200"
                >
                  Sign in to assign a plan
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Social video</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Recommended and Enterprise — mock queue. Connect your video engine (Runway, etc.).
          </p>
          <button
            type="button"
            disabled={generating || !canUseVideo}
            onClick={() => void generateSocialVideo()}
            className="mt-6 w-full rounded-xl bg-zinc-100 py-3 text-sm font-bold text-black hover:bg-white disabled:opacity-40"
          >
            Generate social video
          </button>
          {!user && (
            <p className="mt-2 text-xs text-amber-500/90">Sign in required — then Recommended plan or higher.</p>
          )}
          {user && !canUseVideo && (
            <p className="mt-2 text-xs text-amber-500/90">Upgrade to Recommended to unlock.</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">AI marketing kit</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Enterprise — use the chat API to produce bios, captions, and hashtags from your outfit.
          </p>
          <button
            type="button"
            disabled={generating || !canUseMarketing}
            onClick={() => void generateMarketingKit()}
            className="mt-6 w-full rounded-xl border border-white py-3 text-sm font-bold text-white hover:bg-white hover:text-black disabled:opacity-40"
          >
            Generate kit (chat AI)
          </button>
          {user && !canUseMarketing && (
            <p className="mt-2 text-xs text-amber-500/90">Enterprise plan only.</p>
          )}
          {marketingDraft && (
            <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-zinc-900 p-4 text-left text-xs text-zinc-300 whitespace-pre-wrap">
              {marketingDraft}
            </pre>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Marketplace (mock)</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Listings, inventory, and payments will live in the database (`schema.sql`). This is UX preview only.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {['Hoodie “Nebula”', 'Cargo “Orbit”', 'Cap “Signal”'].map((title) => (
            <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="aspect-[4/5] rounded-lg bg-zinc-800" />
              <p className="mt-3 text-sm font-semibold text-white">{title}</p>
              <p className="text-xs text-zinc-500">Pre-order · $89</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

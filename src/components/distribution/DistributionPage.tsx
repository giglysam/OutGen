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
    price: '15 € / mois',
    bullets: [
      'Génération d’images illimitée (côté produit — quotas API à configurer).',
      'Studio complet + visualisation multi-vues.',
      'Stats tendances de base (module mock jusqu’à data réelle).',
      'Marketplace : mise en ligne limitée (few SKUs / mois en prod).',
    ],
  },
  {
    id: 'premium',
    price: '45 € / mois',
    tag: 'Recommended',
    bullets: [
      'Tout Classic.',
      'Vidéos IA pour réseaux & site (pipeline à brancher).',
      'Analyses avancées, kit marketing auto (légendes, bios — chat IA ici).',
      'Marketplace illimitée + file d’influence (mock).',
      'Support prioritaire.',
    ],
  },
  {
    id: 'enterprise',
    price: 'Sur mesure',
    tag: 'Enterprise',
    bullets: [
      'Tout Recommended.',
      'Images + vidéos + animations marketing avancées (illimité côté offre).',
      'Modèles IA dédiés, intégrations API, SLA.',
      'Branding complet & animations export (mock → provider).',
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
          Compare les offres, simule un changement de plan (mock local), et prépare vidéos / kits marketing selon
          ton tier.
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
                  {active ? 'Plan actif' : 'Choisir (démo)'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="mt-8 w-full rounded-xl bg-white py-3 text-sm font-bold uppercase tracking-wide text-black hover:bg-zinc-200"
                >
                  Connecte-toi pour assigner un plan
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Vidéo sociale</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Recommended & Enterprise — mock de file d’attente. Branche ton moteur vidéo (Runway, etc.).
          </p>
          <button
            type="button"
            disabled={generating || !canUseVideo}
            onClick={() => void generateSocialVideo()}
            className="mt-6 w-full rounded-xl bg-zinc-100 py-3 text-sm font-bold text-black hover:bg-white disabled:opacity-40"
          >
            Générer une vidéo sociale
          </button>
          {!user && (
            <p className="mt-2 text-xs text-amber-500/90">Connexion requise — puis plan Recommended+.</p>
          )}
          {user && !canUseVideo && (
            <p className="mt-2 text-xs text-amber-500/90">Passe au plan Recommended pour débloquer.</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Kit marketing IA</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Enterprise — utilise l’API chat pour produire bio, légendes et hashtags à partir de ta tenue.
          </p>
          <button
            type="button"
            disabled={generating || !canUseMarketing}
            onClick={() => void generateMarketingKit()}
            className="mt-6 w-full rounded-xl border border-white py-3 text-sm font-bold text-white hover:bg-white hover:text-black disabled:opacity-40"
          >
            Générer le kit (chat IA)
          </button>
          {user && !canUseMarketing && (
            <p className="mt-2 text-xs text-amber-500/90">Réservé au plan Enterprise.</p>
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
          Les listings, stocks et paiements iront dans la base (`schema.sql`). Ici : aperçu UX uniquement.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {['Hoodie “Nebula”', 'Cargo “Orbit”', 'Cap “Signal”'].map((title) => (
            <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="aspect-[4/5] rounded-lg bg-zinc-800" />
              <p className="mt-3 text-sm font-semibold text-white">{title}</p>
              <p className="text-xs text-zinc-500">Précommande · 89 €</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'

type GuideTab = 'desktop' | 'mobile'

const guides: Record<GuideTab, { title: string; src: string; hint: string }> = {
  desktop: {
    title: 'Desktop',
    src: '/tutorial/outgen-how-to-desktop.mp4',
    hint: 'Best on a laptop or wide browser window.',
  },
  mobile: {
    title: 'Mobile',
    src: '/tutorial/outgen-how-to-mobile.mp4',
    hint: 'Same app on phone — bottom tabs for Studio, Outfits, Print, and Account.',
  },
}

const steps = [
  'Sign in to your account',
  'Studio — pick clothes and design your outfit',
  'Make my outfit — AI generates your look',
  'Save outfit — keeps it in the cloud',
  'Outfits — browse your saved history',
  'Print — order a physical garment',
  'Track my prints — delivery status',
  'Account — credits and home address',
]

export function HelpPage() {
  const [tab, setTab] = useState<GuideTab>('desktop')
  const guide = guides[tab]

  return (
    <div className="mx-auto max-w-lg px-5 pb-6 pt-8">
      <h1 className="font-display text-3xl font-bold text-white">How to use OutGen</h1>
      <p className="mt-2 text-zinc-400">
        Quick walkthrough for normal users — design, save, print, and track orders.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-1">
        {(Object.keys(guides) as GuideTab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-xl py-3 text-sm font-bold transition ${
              tab === key ? 'bg-violet-600 text-white' : 'text-zinc-400'
            }`}
          >
            {guides[key].title}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-800 bg-black">
        <video
          key={guide.src}
          className="w-full"
          controls
          playsInline
          preload="metadata"
          poster=""
        >
          <source src={guide.src} type="video/mp4" />
        </video>
      </div>
      <p className="mt-2 text-center text-xs text-zinc-500">{guide.hint}</p>

      <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5">
        <p className="text-sm font-bold text-white">What you will learn</p>
        <ol className="mt-4 space-y-2 text-sm text-zinc-300">
          {steps.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-200">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

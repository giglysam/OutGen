export function AnalyticsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Smart analytics</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Illustrative data — connect your analytics backend (segmentation, virality, benchmarks) when the database
          is wired up.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Target audience', value: '18–34 urban', sub: '+12% vs last drop' },
          { label: 'Market trend', value: 'Tech-street', sub: 'Aligned Q2' },
          { label: 'Virality score', value: '78 / 100', sub: 'Mock estimate' },
          { label: 'Brand benchmark', value: 'Top 35%', sub: 'vs luxe sport panel' },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-5"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{c.label}</p>
            <p className="mt-3 font-display text-2xl font-bold text-white">{c.value}</p>
            <p className="mt-1 text-xs text-emerald-400/90">{c.sub}</p>
            <div className="mt-4 h-10 rounded-lg bg-zinc-800/80">
              <div
                className="h-full w-[65%] rounded-lg bg-gradient-to-r from-zinc-600 to-white/30"
                aria-hidden
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Audience segmentation</h2>
          <div className="mt-6 flex items-center justify-center gap-8">
            <div
              className="relative h-40 w-40 rounded-full border-[14px] border-indigo-500/80 border-r-violet-500/60 border-b-fuchsia-500/50 border-l-cyan-500/70"
              aria-hidden
            />
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <span className="text-indigo-400">●</span> Streetwear core 38%
              </li>
              <li>
                <span className="text-fuchsia-400">●</span> Minimal luxe 27%
              </li>
              <li>
                <span className="text-cyan-400">●</span> Outdoor tech 21%
              </li>
              <li>
                <span className="text-zinc-500">●</span> Other 14%
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Monthly trends</h2>
          <div className="mt-8 flex h-44 items-end justify-between gap-2 px-2">
            {[40, 55, 48, 70, 62, 88, 76].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-blue-900/40 to-blue-400/90"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] text-zinc-600">M{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Competitive benchmark</h2>
        <div className="mt-6 space-y-4">
          {[
            { name: 'Your capsule', pct: 82, highlight: true },
            { name: 'Brand A', pct: 74 },
            { name: 'Brand B', pct: 69 },
            { name: 'Brand C', pct: 61 },
          ].map((row) => (
            <div key={row.name} className="flex items-center gap-4">
              <span className="w-28 text-xs text-zinc-400">{row.name}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full ${row.highlight ? 'bg-white' : 'bg-zinc-500'}`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs text-zinc-500">{row.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

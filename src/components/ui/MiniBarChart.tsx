type Point = { date: string; count: number }

export function MiniBarChart({ title, data }: { title: string; data: Point[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{title}</p>
      <div className="mt-3 flex h-28 items-end gap-1">
        {data.map((d) => (
          <div key={d.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="text-[9px] text-zinc-500">{d.count || ''}</span>
            <div
              className="w-full rounded-t bg-violet-600 transition-all"
              style={{ height: `${Math.round((d.count / max) * 100)}%`, minHeight: d.count ? 4 : 2 }}
              title={`${d.date}: ${d.count}`}
            />
            <span className="truncate text-[8px] text-zinc-600">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

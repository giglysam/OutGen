import { useOutGen } from '../../hooks/useOutGen'

export function ToastStack() {
  const { toasts, dismissToast } = useOutGen()
  if (toasts.length === 0) return null
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[200] flex max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismissToast(t.id)}
          className={`pointer-events-auto rounded-xl border px-4 py-3 text-left text-sm shadow-lg transition hover:opacity-90 ${
            t.type === 'error'
              ? 'border-red-500/40 bg-red-950/90 text-red-100'
              : t.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-950/90 text-emerald-50'
                : 'border-zinc-600 bg-zinc-900/95 text-zinc-100'
          }`}
        >
          {t.text}
        </button>
      ))}
    </div>
  )
}

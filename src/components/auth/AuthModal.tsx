import { useState } from 'react'
import { useOutGen } from '../../hooks/useOutGen'

export function AuthModal() {
  const { authOpen, setAuthOpen, signIn, signUp } = useOutGen()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!authOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'in') await signIn(email, password)
      else await signUp(email, password, name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="relative w-full max-w-md rounded-t-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          type="button"
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-900 hover:text-white"
          onClick={() => setAuthOpen(false)}
          aria-label="Close"
        >
          ✕
        </button>
        <h2 id="auth-title" className="font-display text-2xl font-bold text-white">
          {mode === 'in' ? 'Sign in' : 'Create account'}
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {mode === 'up'
            ? 'Get 1 free print credit and save your designs in the cloud.'
            : 'Continue where you left off.'}
        </p>

        {error && (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
          {mode === 'up' && (
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 text-base text-white outline-none focus:border-violet-500"
                placeholder="Alex"
              />
            </label>
          )}
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 text-base text-white outline-none focus:border-violet-500"
              placeholder="you@email.com"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 text-base text-white outline-none focus:border-violet-500"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-violet-600 py-4 text-base font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-500">
          {mode === 'in' ? 'No account yet?' : 'Already have an account?'}{' '}
          <button
            type="button"
            className="font-medium text-violet-400 hover:text-violet-300"
            onClick={() => {
              setMode(mode === 'in' ? 'up' : 'in')
              setError(null)
            }}
          >
            {mode === 'in' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

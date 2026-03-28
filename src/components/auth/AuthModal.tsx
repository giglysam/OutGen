import { useState } from 'react'
import { useOutGen } from '../../hooks/useOutGen'
import type { PlanId } from '../../lib/constants'
import { PLAN_LABELS } from '../../lib/constants'

export function AuthModal() {
  const { authOpen, setAuthOpen, signIn, signUp } = useOutGen()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [plan, setPlan] = useState<PlanId>('classic')

  if (!authOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'in') signIn(email, password)
    else signUp(email, password, name, plan)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          type="button"
          className="absolute right-4 top-4 text-zinc-500 hover:text-white"
          onClick={() => setAuthOpen(false)}
          aria-label="Fermer"
        >
          ✕
        </button>
        <h2 id="auth-title" className="font-display text-2xl font-bold text-white">
          {mode === 'in' ? 'Connexion' : 'Créer un compte'}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Auth mock — stockage local uniquement. Branche ton provider (Clerk, Supabase…) plus tard.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {mode === 'up' && (
            <label className="block text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              Nom affiché
              <input
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
          )}
          <label className="block text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
            E-mail
            <input
              required
              type="email"
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="block text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
            Mot de passe
            <input
              required
              type="password"
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            />
          </label>
          {mode === 'up' && (
            <label className="block text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              Plan de départ (démo)
              <select
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-white"
                value={plan}
                onChange={(e) => setPlan(e.target.value as PlanId)}
              >
                {(Object.keys(PLAN_LABELS) as PlanId[]).map((p) => (
                  <option key={p} value={p}>
                    {PLAN_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="submit"
            className="mt-2 rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200"
          >
            {mode === 'in' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-center text-sm text-zinc-500 hover:text-white"
          onClick={() => setMode(mode === 'in' ? 'up' : 'in')}
        >
          {mode === 'in' ? 'Pas encore de compte ? Inscription' : 'Déjà un compte ? Connexion'}
        </button>
      </div>
    </div>
  )
}

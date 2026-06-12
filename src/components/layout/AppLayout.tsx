import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useOutGen } from '../../hooks/useOutGen'
import { AuthModal } from '../auth/AuthModal'
import { OnboardingModal } from '../onboarding/OnboardingModal'
import { ToastStack } from '../ui/ToastStack'

const mobileTabs = [
  { to: '/', label: 'Studio', end: true },
  { to: '/designs', label: 'Outfits', end: false },
  { to: '/print', label: 'Print', end: false },
  { to: '/account', label: 'Account', end: false },
] as const

export function AppLayout() {
  const { pathname } = useLocation()
  const hideBottomNav = pathname === '/'
  const { user, profile, guestUsed, guestLimit, setAuthOpen, signOut, generating, generateProgress } = useOutGen()

  return (
    <div className="flex min-h-dvh flex-col bg-[#060607] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060607]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-5 py-4">
          <NavLink to="/" className="font-display text-xl font-extrabold tracking-tight text-white">
            OutGen
          </NavLink>

          <div className="flex items-center gap-2">
            {generating && (
              <span className="hidden max-w-[120px] truncate text-[10px] text-zinc-500 sm:inline">
                {generateProgress}
              </span>
            )}
            {user ? (
              <>
                {profile != null && (
                  <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-200">
                    {profile.credits_balance} cr
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-400"
                >
                  Out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-black"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
        {!user && (
          <p className="pb-2 text-center text-[10px] text-zinc-600">
            Guest trial {guestUsed}/{guestLimit}
          </p>
        )}
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col">
        <Outlet />
      </main>

      {!hideBottomNav && (
        <nav
          className="sticky bottom-0 z-50 border-t border-white/10 bg-[#060607]/95 backdrop-blur-xl"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
          aria-label="Main"
        >
          <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-3 py-2">
            {mobileTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center rounded-2xl py-2.5 text-[11px] font-semibold transition ${
                    isActive ? 'bg-white/10 text-white' : 'text-zinc-500'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}

      <AuthModal />
      <OnboardingModal />
      <ToastStack />
    </div>
  )
}

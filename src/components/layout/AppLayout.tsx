import { NavLink, Outlet } from 'react-router-dom'
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

      <main
        className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col"
        style={{ paddingBottom: 'var(--app-nav-height)' }}
      >
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#060607]/98 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Main"
      >
        <div className="mx-auto grid h-[4.5rem] max-w-lg grid-cols-4 px-1">
          {mobileTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center justify-center rounded-xl px-1 text-center text-[11px] font-bold leading-tight transition sm:text-xs ${
                  isActive ? 'bg-violet-600 text-white' : 'text-zinc-500'
                }`
              }
            >
              <span className="truncate">{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <AuthModal />
      <OnboardingModal />
      <ToastStack />
    </div>
  )
}

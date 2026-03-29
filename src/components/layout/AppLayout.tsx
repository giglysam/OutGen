import { NavLink, Outlet } from 'react-router-dom'
import { useOutGen } from '../../hooks/useOutGen'
import { AuthModal } from '../auth/AuthModal'
import { ChatPanel } from '../chat/ChatPanel'
import { ToastStack } from '../ui/ToastStack'

const tabs = [
  { to: '/', label: 'Studio' },
  { to: '/visualiser', label: 'Visualiser' },
  { to: '/stats', label: 'Stats' },
  { to: '/distribution', label: 'Distribution' },
] as const

export function AppLayout() {
  const { user, guestUsed, guestLimit, setAuthOpen, signOut, setChatOpen, generating, generateProgress } =
    useOutGen()

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0a0b] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#0a0a0b]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
              OutGen
            </NavLink>
            <span className="hidden rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 md:inline">
              Studio IA
            </span>
          </div>

          <nav className="order-3 flex w-full justify-center gap-1 sm:order-none sm:w-auto sm:justify-start">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition sm:text-sm ${
                    isActive
                      ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                      : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {generating && (
              <span className="hidden max-w-[200px] truncate text-xs text-zinc-500 lg:inline">
                {generateProgress}
              </span>
            )}
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 hover:border-zinc-500"
            >
              Aide IA
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-right text-xs text-zinc-500 sm:block">
                  <span className="block font-medium text-zinc-300">{user.name}</span>
                  <span className="uppercase">{user.plan}</span>
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium hover:bg-zinc-800"
                >
                  Déco
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-0.5">
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black hover:bg-zinc-200"
                >
                  Connexion
                </button>
                <span className="text-[10px] text-zinc-500">
                  Essai {guestUsed}/{guestLimit} générations
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col px-4 py-3 sm:px-6 sm:py-4">
        <Outlet />
      </main>

      <AuthModal />
      <ChatPanel />
      <ToastStack />
    </div>
  )
}

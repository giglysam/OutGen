import { NavLink, Outlet } from 'react-router-dom'
import { useOutGen } from '../../hooks/useOutGen'
import { AuthModal } from '../auth/AuthModal'
import { ChatPanel } from '../chat/ChatPanel'
import { ToastStack } from '../ui/ToastStack'

const tabs = [
  { to: '/', label: 'Studio', short: 'Studio', end: true },
  { to: '/visualiser', label: 'Visualiser', short: 'Vues', end: false },
  { to: '/stats', label: 'Stats', short: 'Stats', end: false },
  { to: '/distribution', label: 'Distribution', short: 'Ship', end: false },
] as const

function tabClassName(isActive: boolean, compact?: boolean) {
  return compact
    ? `flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-bold uppercase tracking-wide transition active:scale-[0.97] ${
        isActive
          ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
          : 'text-zinc-500 hover:text-zinc-300'
      }`
    : `rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wide transition sm:text-sm ${
        isActive
          ? 'bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.12)]'
          : 'text-zinc-500 hover:bg-zinc-900/80 hover:text-zinc-200'
      }`
}

export function AppLayout() {
  const { user, guestUsed, guestLimit, setAuthOpen, signOut, setChatOpen, generating, generateProgress, setChatMode } =
    useOutGen()

  return (
    <div className="flex min-h-dvh flex-col bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(168,85,247,0.12),transparent_55%),radial-gradient(90%_60%_at_100%_0%,rgba(59,130,246,0.08),transparent_50%),#060607] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060607]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <NavLink
                to="/"
                className="font-display text-lg font-extrabold tracking-tight text-white sm:text-2xl"
              >
                OutGen
              </NavLink>
              <span className="hidden rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-zinc-400 md:inline">
                AI studio
              </span>
            </div>

            <nav className="hidden flex-1 justify-center gap-1 lg:flex">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) => tabClassName(isActive, false)}
                >
                  {tab.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {generating && (
              <span className="hidden max-w-[160px] truncate text-[10px] text-zinc-500 lg:inline">
                {generateProgress}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setChatMode('design')
                setChatOpen(true)
              }}
              className="touch-manipulation rounded-xl border border-fuchsia-500/35 bg-fuchsia-500/10 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-fuchsia-100 shadow-[0_0_24px_rgba(217,70,239,0.15)] sm:px-3 sm:text-xs"
            >
              AI design
            </button>
            <button
              type="button"
              onClick={() => {
                setChatMode('help')
                setChatOpen(true)
              }}
              className="touch-manipulation hidden rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-300 sm:inline sm:px-3 sm:text-xs"
            >
              Help
            </button>
            {user ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden text-right text-[10px] text-zinc-500 sm:block">
                  <span className="block font-medium text-zinc-300">{user.name}</span>
                  <span className="uppercase">{user.plan}</span>
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  className="touch-manipulation rounded-xl border border-white/10 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide hover:bg-white/5 sm:px-3 sm:text-xs"
                >
                  Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-0.5">
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="touch-manipulation rounded-xl bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-black shadow-[0_0_28px_rgba(255,255,255,0.12)] sm:text-xs"
                >
                  Sign in
                </button>
                <span className="text-[9px] text-zinc-500">
                  Guest {guestUsed}/{guestLimit}
                </span>
              </div>
            )}
            </div>
          </div>

          <nav
            className="kbd-scroll flex gap-1 overflow-x-auto pb-0.5 lg:hidden"
            aria-label="Main navigation"
          >
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `touch-manipulation shrink-0 rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-wide ${
                    isActive
                      ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.12)]'
                      : 'border border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col px-3 py-3 sm:px-6 sm:py-4">
        <Outlet />
      </main>

      <AuthModal />
      <ChatPanel />
      <ToastStack />
    </div>
  )
}

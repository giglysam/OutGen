import { useState } from 'react'
import { useOutGen } from '../../hooks/useOutGen'
import { refineCreativeNotesWithLlm, sendChatMessage } from '../../lib/api'
import { buildGarmentDescription } from '../../lib/promptBuilder'

const DESIGN_SUGGESTIONS = [
  'Add oversized chest typography',
  'Metallic foil logo on the hood',
  'Neon piping on seams',
  'Vintage cracked print on the back',
  'Small embroidered arch logo',
]

export function ChatPanel() {
  const {
    chatOpen,
    setChatOpen,
    chatMode,
    setChatMode,
    selection,
    logoDescription,
    userPrompt,
    applyRefinedNotes,
  } = useOutGen()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text:
        chatMode === 'design'
          ? 'Describe what to add or change (text, graphics, materials). I will refine your creative notes for the image model.'
          : 'Ask about OutGen, plans, or how the studio works.',
    },
  ])
  const [loading, setLoading] = useState(false)

  if (!chatOpen) return null

  async function send() {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: q }])
    setLoading(true)
    try {
      if (chatMode === 'design') {
        const garmentSummary = buildGarmentDescription(selection)
        const refined = await refineCreativeNotesWithLlm({
          garmentSummary,
          logoText: logoDescription,
          currentNotes: userPrompt,
          userInstruction: q,
        })
        applyRefinedNotes(refined)
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text: `Updated creative notes:\n\n${refined}`,
          },
        ])
      } else {
        const reply = await sendChatMessage(
          `Context: OutGen fashion AI studio (multi-view previews, guest trials, plans). Answer in French, concise. User question: ${q}`,
        )
        setMessages((m) => [...m, { role: 'assistant', text: reply }])
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: e instanceof Error ? e.message : 'Network error.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function switchMode(next: 'help' | 'design') {
    setChatMode(next)
    setMessages([
      {
        role: 'assistant',
        text:
          next === 'design'
            ? 'Describe what to add or change. I will rewrite the English creative notes used in the image prompt.'
            : 'Ask about OutGen or the studio. Answers stay short and practical.',
      },
    ])
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex justify-end bg-black/55 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#070708]/95 shadow-[0_0_80px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight text-white">AI assistant</h3>
            <p className="text-[10px] text-zinc-500">chat-z.created.app</p>
          </div>
          <button
            type="button"
            onClick={() => setChatOpen(false)}
            className="rounded-xl p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 border-b border-white/10 px-3 py-2">
          <button
            type="button"
            onClick={() => switchMode('design')}
            className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-wide transition ${
              chatMode === 'design'
                ? 'bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white shadow-lg'
                : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Refine design
          </button>
          <button
            type="button"
            onClick={() => switchMode('help')}
            className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-wide transition ${
              chatMode === 'help'
                ? 'bg-white text-black shadow-lg'
                : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Help
          </button>
        </div>

        {chatMode === 'design' && (
          <div className="kbd-scroll flex gap-1.5 overflow-x-auto border-b border-white/5 px-3 py-2">
            {DESIGN_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setInput(s)}
                className="shrink-0 rounded-full border border-white/10 bg-zinc-900/80 px-3 py-1.5 text-[10px] font-medium text-zinc-300 hover:border-fuchsia-500/50 hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="kbd-scroll flex-1 space-y-3 overflow-y-auto overscroll-y-contain p-4 text-sm">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-2xl px-3 py-2.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'ml-8 border border-white/10 bg-zinc-800/90 text-white'
                  : 'mr-6 border border-white/5 bg-zinc-900/80 text-zinc-300'
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && <p className="text-xs text-fuchsia-300/80">Thinking…</p>}
        </div>

        <div
          className="border-t border-white/10 p-3"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex gap-2">
            <input
              className="min-h-[44px] flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-zinc-600 focus:border-fuchsia-500/60"
              placeholder={chatMode === 'design' ? 'e.g. add chrome 3D text on chest…' : 'Your question…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void send()
              }}
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading}
              className="min-h-[44px] shrink-0 rounded-xl bg-white px-4 text-xs font-bold text-black shadow-[0_0_24px_rgba(255,255,255,0.12)] disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

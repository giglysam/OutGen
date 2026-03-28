import { useState } from 'react'
import { useOutGen } from '../../hooks/useOutGen'
import { sendChatMessage } from '../../lib/api'

export function ChatPanel() {
  const { chatOpen, setChatOpen } = useOutGen()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: "Je t’aide à comprendre OutGen, les plans, ou à reformuler ta tenue. Pose ta question.",
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
      const reply = await sendChatMessage(
        `Contexte: plateforme OutGen (studio mode IA, génération multi-vues, plans Classic/Recommended/Enterprise). Réponds en français, concis. Question utilisateur: ${q}`,
      )
      setMessages((m) => [...m, { role: 'assistant', text: reply }])
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: e instanceof Error ? e.message : 'Erreur réseau.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-[#0c0c0e] shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <h3 className="font-display text-lg font-semibold">Chat assistance</h3>
          <button
            type="button"
            onClick={() => setChatOpen(false)}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900 hover:text-white"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-xl px-3 py-2 ${
                msg.role === 'user' ? 'ml-6 bg-zinc-800 text-white' : 'mr-6 bg-zinc-900 text-zinc-300'
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && <p className="text-xs text-zinc-500">Envoi…</p>}
        </div>
        <div className="border-t border-zinc-800 p-3">
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-white"
              placeholder="Ta question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button
              type="button"
              onClick={send}
              disabled={loading}
              className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black disabled:opacity-50"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

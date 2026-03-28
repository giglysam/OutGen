import { CHAT_API, IMAGE_API } from './constants'

export async function generateImage(prompt: string): Promise<string> {
  const response = await fetch(IMAGE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `Image API error ${response.status}`)
  }

  const data = (await response.json()) as { imageUrl?: string }
  if (!data.imageUrl) throw new Error('Réponse image invalide (imageUrl manquant).')
  return data.imageUrl
}

export async function sendChatMessage(prompt: string): Promise<string> {
  const response = await fetch(CHAT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `Chat API error ${response.status}`)
  }

  const result = (await response.json()) as { success?: boolean; content?: string }
  if (result.success && result.content) return result.content
  throw new Error('Réponse chat invalide.')
}

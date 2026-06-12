export const WHATSAPP_PHONE = '96171831770'

/** Opens WhatsApp with a pre-filled message (works on mobile + desktop). */
export function whatsAppPayUrl(message: string): string {
  const text = encodeURIComponent(message)
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${text}`
}

/** Navigate straight to WhatsApp — use instead of window.open (often blocked on mobile). */
export function openWhatsApp(message: string): void {
  window.location.assign(whatsAppPayUrl(message))
}

export function subscriptionPayMessage(userEmail: string, userName: string): string {
  return `Hi! I'd like to subscribe to OutGen Studio ($30/month, 3 print credits). My account: ${userName} (${userEmail}).`
}

export function creditsPayMessage(userEmail: string, userName: string, amount: number): string {
  const price = amount * 10
  return `Hi! I'd like to buy ${amount} print credit${amount === 1 ? '' : 's'} ($${price}). My account: ${userName} (${userEmail}).`
}

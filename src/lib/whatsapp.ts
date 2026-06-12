export const WHATSAPP_PHONE = '96171831770'

export function whatsAppPayUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}

export function subscriptionPayMessage(userEmail: string, userName: string): string {
  return `Hi! I'd like to subscribe to OutGen Studio ($30/month, 3 print credits). My account: ${userName} (${userEmail}).`
}

export function creditsPayMessage(userEmail: string, userName: string, amount: number): string {
  const price = amount * 10
  return `Hi! I'd like to buy ${amount} print credit${amount === 1 ? '' : 's'} ($${price}). My account: ${userName} (${userEmail}).`
}

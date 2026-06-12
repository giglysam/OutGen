/**
 * Resend email helper. Set RESEND_API_KEY in Vercel.
 * In Resend test mode, emails can only go to OWNER_EMAIL — never send to customers until domain is verified.
 */
export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const from = process.env.RESEND_FROM || 'onboarding@resend.dev'
  const owner = ownerEmail()
  const recipients = (Array.isArray(to) ? to : [to]).map((r) => {
    if (r !== owner) {
      console.warn(`Resend: redirecting ${r} → owner inbox (${owner})`)
      return owner
    }
    return r
  })
  const uniqueRecipients = [...new Set(recipients)]

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: uniqueRecipients, subject, html }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error: ${err}`)
  }

  return res.json()
}

export function ownerEmail() {
  return process.env.OWNER_EMAIL || 'gabriel.salem2008@outlook.com'
}

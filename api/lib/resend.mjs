/**
 * Resend email helper. Set RESEND_API_KEY in Vercel (replace re_xxxxxxxxx with your real key).
 */
export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const from = process.env.RESEND_FROM || 'onboarding@resend.dev'
  const recipients = Array.isArray(to) ? to : [to]

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: recipients, subject, html }),
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

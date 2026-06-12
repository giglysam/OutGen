import { sendEmail, ownerEmail } from '../resend.mjs'
import { verifyUserToken } from '../supabaseAdmin.mjs'

const WHATSAPP_DISPLAY = '+961 71 831 770'

export async function handleNotifyPurchase(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const user = await verifyUserToken(req.headers.authorization)
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}
    const type = body.type === 'subscription' ? 'subscription' : 'credits'
    const creditAmount = Number(body.creditAmount) || 1
    const userEmail = String(body.userEmail || user.email || '')
    const userName = String(body.userName || user.user_metadata?.display_name || userEmail.split('@')[0])

    const isSub = type === 'subscription'
    const price = isSub ? '$30/month' : `$${creditAmount * 10}`
    const detail = isSub
      ? 'OutGen Studio subscription (3 print credits per month)'
      : `${creditAmount} print credit${creditAmount === 1 ? '' : 's'}`

    const ownerHtml = `
      <h2>Payment request: ${isSub ? 'Subscription' : 'Credits'}</h2>
      <p><strong>User:</strong> ${userName} (${userEmail})</p>
      <p><strong>Request:</strong> ${detail} — ${price}</p>
      <p>User was sent to WhatsApp (${WHATSAPP_DISPLAY}) to pay.</p>
      <p>Confirm payment in WhatsApp, then add credits in the admin dashboard.</p>
    `

    await sendEmail({
      to: ownerEmail(),
      subject: `💳 Payment request: ${userName} — ${detail}`,
      html: ownerHtml,
    })

    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Email failed' })
  }
}

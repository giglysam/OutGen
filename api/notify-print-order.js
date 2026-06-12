import { sendEmail, ownerEmail } from './lib/resend.mjs'
import { verifyUserToken } from './lib/supabaseAdmin.mjs'

export default async function handler(req, res) {
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
    const {
      orderId,
      designTitle,
      thumbnailUrl,
      productLabel,
      qualityLabel,
      quantity,
      creditsTotal,
      mapsUrl,
      userName,
      userEmail,
      city,
      country,
      addressLine,
    } = body

    if (!orderId || !mapsUrl) {
      res.status(400).json({ error: 'Missing order details' })
      return
    }

    const imgBlock = thumbnailUrl
      ? `<p><strong>Design preview:</strong></p><p><a href="${thumbnailUrl}">View image</a></p><p><img src="${thumbnailUrl}" alt="Design" style="max-width:320px;border-radius:12px" /></p>`
      : '<p><em>No preview image</em></p>'

    const ownerHtml = `
      <h2>New print order #${orderId.slice(0, 8)}</h2>
      <p><strong>Customer:</strong> ${userName || user.email} (${userEmail || user.email})</p>
      <p><strong>Product:</strong> ${productLabel} × ${quantity}</p>
      <p><strong>Quality:</strong> ${qualityLabel}</p>
      <p><strong>Credits charged:</strong> ${creditsTotal}</p>
      <p><strong>Delivery location:</strong><br/>
        ${[addressLine, city, country].filter(Boolean).join(', ') || '—'}<br/>
        <a href="${mapsUrl}">${mapsUrl}</a>
      </p>
      <p><strong>Design:</strong> ${designTitle || 'Untitled'}</p>
      ${imgBlock}
      <p>Production ETA ~7 days, then ship to the maps location above.</p>
    `

    await sendEmail({
      to: ownerEmail(),
      subject: `🖨️ Print order: ${productLabel} for ${userName || userEmail}`,
      html: ownerHtml,
    })

    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Email failed' })
  }
}

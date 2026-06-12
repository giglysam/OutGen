/**
 * Single Vercel serverless function — all /api/* routed here via vercel.json rewrite.
 */
import { handleAdminOrders } from '../server/vercel/handlers/adminOrders.mjs'
import { handleAdminCrm } from '../server/vercel/handlers/adminCrm.mjs'
import { handleAdminCredits } from '../server/vercel/handlers/adminCredits.mjs'
import { handleNotifyPrintOrder } from '../server/vercel/handlers/notifyPrint.mjs'
import { handleNotifyPurchase } from '../server/vercel/handlers/notifyPurchase.mjs'
import { handleSignupCheck } from '../server/vercel/handlers/signupCheck.mjs'
import { handleRecordSignup } from '../server/vercel/handlers/signupRecord.mjs'
import { handleChat } from '../server/vercel/handlers/chat.mjs'
import { handleGenerateImage } from '../server/vercel/handlers/generateImage.mjs'
import { handleSetupDb } from '../server/vercel/handlers/setupDb.mjs'

function routeKey(req) {
  if (req.query?.route) {
    return String(req.query.route).replace(/^\/+|\/+$/g, '')
  }

  const raw = req.query?.path
  if (raw) {
    const segs = Array.isArray(raw) ? raw : [String(raw)]
    return segs.join('/')
  }

  try {
    const url = new URL(req.url || '/', 'http://localhost')
    return url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '')
  } catch {
    return ''
  }
}

export default async function handler(req, res) {
  const route = routeKey(req)

  switch (route) {
    case 'chat':
      return handleChat(req, res)
    case 'generate-image':
      return handleGenerateImage(req, res)
    case 'setup-db':
      return handleSetupDb(req, res)

    case 'admin':
    case 'admin/orders':
      return handleAdminOrders(req, res)
    case 'admin/crm':
      return handleAdminCrm(req, res)
    case 'admin/credits':
      return handleAdminCredits(req, res)

    case 'notify-print-order':
      return handleNotifyPrintOrder(req, res)
    case 'notify-purchase':
      return handleNotifyPurchase(req, res)

    case 'signup-check':
      return handleSignupCheck(req, res)
    case 'record-signup':
      return handleRecordSignup(req, res)

    default:
      res.status(404).json({ error: `Unknown API route: /api/${route || '(root)'}` })
  }
}

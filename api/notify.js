import { handleNotifyPrintOrder } from './lib/handlers/notifyPrint.mjs'
import { handleNotifyPurchase } from './lib/handlers/notifyPurchase.mjs'

/** Single notify function — routes: print-order | purchase */
export default async function handler(req, res) {
  const type = String(req.query?.type || 'print-order')
  if (type === 'purchase') return handleNotifyPurchase(req, res)
  return handleNotifyPrintOrder(req, res)
}

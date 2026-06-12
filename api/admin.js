import { handleAdminOrders } from './lib/handlers/adminOrders.mjs'
import { handleAdminCrm } from './lib/handlers/adminCrm.mjs'
import { handleAdminCredits } from './lib/handlers/adminCredits.mjs'

/** Single admin function — routes: orders | crm | credits (via ?path= or vercel rewrite) */
export default async function handler(req, res) {
  const path = String(req.query?.path || 'orders')

  if (path === 'crm') return handleAdminCrm(req, res)
  if (path === 'credits') return handleAdminCredits(req, res)
  return handleAdminOrders(req, res)
}

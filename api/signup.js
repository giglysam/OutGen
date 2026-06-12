import { handleSignupCheck } from './lib/handlers/signupCheck.mjs'
import { handleRecordSignup } from './lib/handlers/signupRecord.mjs'

/** Single signup function — routes: check | record */
export default async function handler(req, res) {
  const action = String(req.query?.action || 'check')
  if (action === 'record') return handleRecordSignup(req, res)
  return handleSignupCheck(req, res)
}

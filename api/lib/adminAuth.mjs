export function verifyAdmin(req, res) {
  const secret = process.env.ADMIN_SECRET
  const provided = req.headers['x-admin-secret'] || req.query?.secret
  if (!secret || provided !== secret) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

export function toCsv(rows, columns) {
  const esc = (v) => {
    const s = v == null ? '' : String(v)
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const header = columns.map((c) => esc(c.label)).join(',')
  const body = rows.map((row) => columns.map((c) => esc(c.value(row))).join(',')).join('\n')
  return `${header}\n${body}`
}

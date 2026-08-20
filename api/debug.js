export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const url = process.env.DATABASE_URL || '';
  let host = 'NOT_SET';
  try { host = new URL(url).host || host; } catch {}
  // 不返回密码，只返回 host 和 pgbouncer 参数
  const hasPgbouncer = url.includes('pgbouncer=true');
  const hasPooler = url.includes('pooler.supabase.com');
  const hasOldDb = url.includes('db.cdebutpykrqzfiqhkpib.supabase.co');
  return res.status(200).json({ host, hasPooler, hasPgbouncer, hasOldDb, hint: hasOldDb ? '仍是旧直连，已导致 ENOTFOUND，请在 Vercel 改为 pooler 6543 并 Redeploy' : 'OK' });
}

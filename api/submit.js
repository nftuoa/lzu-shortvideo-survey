import pg from 'pg';
const { Pool } = pg;

let pool;
function getPool() {
  if (pool) return pool;
  const connStr = process.env.DATABASE_URL;
  if (!connStr) throw new Error('DATABASE_URL not set - 请在 Vercel 环境变量中配置 Pooler 连接串 (aws-0-...pooler.supabase.com:6543?pgbouncer=true)，直连 db.* 为 IPv6-only 会导致 ENOTFOUND');
  pool = new Pool({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10000,
  });
  return pool;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const DURATION_MAP = { '<30分钟':15, '30-60分钟':45, '1-2小时':90, '2-3小时':150, '>3小时':210 };
const FREQ_MAP = { '<3次':2, '3-5次':4, '6-10次':8, '>10次':12 };

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok:false, msg:'Method not allowed' });

  try {
    const b = req.body || {};
    // 基础校验
    if (b.att !== 5) return res.status(400).json({ ok:false, msg:'注意力检测未通过' });
    // 必填校验（按 02 问卷定稿必答项）
    const required = ['a1_gender','a2_grade','b1_platform','b2_duration','b3_freq','b5_live_freq'];
    for (const k of required) if (!b[k]) return res.status(400).json({ ok:false, msg:`缺失必填: ${k}` });

    // 数值范围校验 1-5
    const likert = ['b6_1','b6_2','b6_3','b7_1','b7_2','b7_3','b7_4','c1_1','c1_2','c1_3','c1_4','c2_1','c2_2','c2_3','c3_1','c3_2','c3_3','c3_4','c3_5','d1_1','d1_2','d1_3','d1_4','d2_1','d2_2','d2_3','d2_4','e1_1','e1_2','e1_3'];
    for (const k of likert) if (b[k]!==undefined && (b[k]<1 || b[k]>5)) return res.status(400).json({ ok:false, msg:`${k}超出1-5` });

    // 互斥：E2 选不需要则清空其他
    if (Array.isArray(b.e2_choices) && b.e2_choices.includes('不需要') && b.e2_choices.length>1) {
      b.e2_choices = ['不需要'];
    }

    // 计算均分
    const avg = arr => +(arr.reduce((s,v)=>s+v,0)/arr.length).toFixed(2);
    const b6_avg = avg([b.b6_1,b.b6_2,b.b6_3]);
    const b7_avg = avg([b.b7_1,b.b7_2,b.b7_3,b.b7_4]);
    const c1_avg = avg([b.c1_1,b.c1_2,b.c1_3,b.c1_4]);
    const c2_avg = avg([b.c2_1,b.c2_2,b.c2_3]);
    const c3_avg = avg([b.c3_1,b.c3_2,b.c3_3,b.c3_4,b.c3_5]);
    const d1_avg = avg([b.d1_1,b.d1_2,b.d1_3,b.d1_4]);
    const d2_avg = avg([b.d2_1,b.d2_2,b.d2_3,b.d2_4]);
    const e1_avg = avg([b.e1_1,b.e1_2,b.e1_3]);
    const a6_self = b.a6_self ?? null;

    // 时长/频率中点
    const b2_min = DURATION_MAP[b.b2_duration] ?? null;
    const b3_count = FREQ_MAP[b.b3_freq] ?? null;

    // IP hash（不存明文）
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    const ip_hash = await hash(ip);

    const p = getPool();
    const sql = `
      insert into survey_responses
      (a1_gender,a2_grade,a3_college,a4_expense,a5_hometown,a6_self,a6_obj,
       b1_platform,b2_duration,b2_duration_min,b3_freq,b3_freq_count,b4_prefs,b5_live_freq,
       b6_1,b6_2,b6_3,b6_avg,b7_1,b7_2,b7_3,b7_4,b7_avg,
       c1_1,c1_2,c1_3,c1_4,c1_avg,c2_1,c2_2,c2_3,c2_avg,c3_1,c3_2,c3_3,c3_4,c3_5,c3_avg,
       att_correct,mk1,mk2,d1_regret,
       d1_1,d1_2,d1_3,d1_4,d1_avg,d2_1,d2_2,d2_3,d2_4,d2_avg,
       e1_1,e1_2,e1_3,e1_avg,e2_choices,e2_moment,e2_tip,
       user_agent,ip_hash,duration_seconds)
      values
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,$57,$58,$59)
      returning id
    `;
    const vals = [
      b.a1_gender,b.a2_grade,b.a3_college||null,b.a4_expense||null,b.a5_hometown||null,a6_self,b.a6_obj??null,
      b.b1_platform,b.b2_duration,b2_min,b.b3_freq,b3_count,b.b4_prefs||null,b.b5_live_freq,
      b.b6_1,b.b6_2,b.b6_3,b6_avg,b.b7_1,b.b7_2,b.b7_3,b.b7_4,b7_avg,
      b.c1_1,b.c1_2,b.c1_3,b.c1_4,c1_avg,b.c2_1,b.c2_2,b.c2_3,c2_avg,b.c3_1,b.c3_2,b.c3_3,b.c3_4,b.c3_5,c3_avg,
      true,b.mk1??null,b.mk2??null,b.d1_regret??null,
      b.d1_1,b.d1_2,b.d1_3,b.d1_4,d1_avg,b.d2_1,b.d2_2,b.d2_3,b.d2_4,d2_avg,
      b.e1_1,b.e1_2,b.e1_3,e1_avg,b.e2_choices||null,b.e2_moment||null,b.e2_tip||null,
      req.headers['user-agent']||null,ip_hash,b.duration_seconds||null
    ];
    const r = await p.query(sql, vals);
    return res.status(200).json({ ok:true, id: r.rows[0].id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok:false, msg: e.message });
  }
}

async function hash(s){
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,16);
}

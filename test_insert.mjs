import pg from 'pg';
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL, ssl:{rejectUnauthorized:false}});
const avg=a=>+(a.reduce((s,v)=>s+v,0)/a.length).toFixed(2);
const p={a1_gender:'女',a2_grade:'大三',a3_college:'人文社科',a4_expense:'2500-3999元',a5_hometown:'一线/新一线城市',a6_self:4.0,a6_obj:3,b1_platform:'小红书',b2_duration:'2-3小时',b3_freq:'6-10次',b4_prefs:['美妆穿搭','炫富/奢侈品展示'],b5_live_freq:'每周1-2次',b6_1:5,b6_2:4,b6_3:5,b7_1:5,b7_2:5,b7_3:5,b7_4:4,c1_1:5,c1_2:4,c1_3:4,c1_4:5,c2_1:4,c2_2:4,c2_3:3,c3_1:3,c3_2:4,c3_3:3,c3_4:4,c3_5:3,mk1:5,mk2:5,d1_regret:4,d1_1:4,d1_2:4,d1_3:2,d1_4:4,d2_1:3,d2_2:3,d2_3:2,d2_4:4,e1_1:2,e1_2:2,e1_3:2,e2_choices:['媒介素养/算法识别教育','平台增加冷静期/消费提醒'],e2_moment:'B站种草视频',e2_tip:'关闭免密支付'};
const r=await pool.query(`insert into survey_responses
(a1_gender,a2_grade,a3_college,a4_expense,a5_hometown,a6_self,a6_obj,b1_platform,b2_duration,b2_duration_min,b3_freq,b3_freq_count,b4_prefs,b5_live_freq,b6_1,b6_2,b6_3,b6_avg,b7_1,b7_2,b7_3,b7_4,b7_avg,c1_1,c1_2,c1_3,c1_4,c1_avg,c2_1,c2_2,c2_3,c2_avg,c3_1,c3_2,c3_3,c3_4,c3_5,c3_avg,att_correct,mk1,mk2,d1_regret,d1_1,d1_2,d1_3,d1_4,d1_avg,d2_1,d2_2,d2_3,d2_4,d2_avg,e1_1,e1_2,e1_3,e1_avg,e2_choices,e2_moment,e2_tip,duration_seconds) values
($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55) returning id`,
[ p.a1_gender,p.a2_grade,p.a3_college,p.a4_expense,p.a5_hometown,p.a6_self,p.a6_obj,p.b1_platform,p.b2_duration,150,p.b3_freq,8,p.b4_prefs,p.b5_live_freq,p.b6_1,p.b6_2,p.b6_3,avg([p.b6_1,p.b6_2,p.b6_3]),p.b7_1,p.b7_2,p.b7_3,p.b7_4,avg([p.b7_1,p.b7_2,p.b7_3,p.b7_4]),p.c1_1,p.c1_2,p.c1_3,p.c1_4,avg([p.c1_1,p.c1_2,p.c1_3,p.c1_4]),p.c2_1,p.c2_2,p.c2_3,avg([p.c2_1,p.c2_2,p.c2_3]),p.c3_1,p.c3_2,p.c3_3,p.c3_4,p.c3_5,avg([p.c3_1,p.c3_2,p.c3_3,p.c3_4,p.c3_5]),true,p.mk1,p.mk2,p.d1_regret,p.d1_1,p.d1_2,p.d1_3,p.d1_4,avg([p.d1_1,p.d1_2,p.d1_3,p.d1_4]),p.d2_1,p.d2_2,p.d2_3,p.d2_4,avg([p.d2_1,p.d2_2,p.d2_3,p.d2_4]),p.e1_1,p.e1_2,p.e1_3,avg([p.e1_1,p.e1_2,p.e1_3]),p.e2_choices,p.e2_moment,p.e2_tip,245]);
console.log('insert id',r.rows[0].id);
const c=await pool.query('select id, a1_gender, b1_platform, b2_duration, c1_avg, d1_avg, created_at from survey_responses order by id desc limit 2');
console.log(c.rows);
await pool.end();

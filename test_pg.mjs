import pg from 'pg';
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL, ssl:{rejectUnauthorized:false}});
const r = await pool.query('select count(*) from survey_responses');
console.log('pg ok', r.rows[0]);
await pool.end();

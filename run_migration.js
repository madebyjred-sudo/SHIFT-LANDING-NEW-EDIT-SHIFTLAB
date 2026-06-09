const { Pool } = require('pg');
const fs = require('fs');

async function main() {
  const connectionString = "postgresql://postgres.atkgikgaysuhcxnvigui:54PYAdauq6GjxA1r@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const sql = fs.readFileSync('/Users/juan/shiftpn-web/lib/db/migrations/002_feedback_metrics.sql', 'utf8');
    await pool.query(sql);
    console.log("Migration applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

main();

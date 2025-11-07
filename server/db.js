import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || process.env.MYSQL_PASSWORD || "",
  database: process.env.DB_NAME || "space_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then(() => console.log("✅ Connected to MySQL database:", process.env.DB_NAME))
  .catch(err => console.error("❌ Failed to connect to MySQL:", err.message));

// graceful shutdown (optional)
export async function closePool() {
  try { await pool.end(); } catch (e) { console.error('Error closing DB pool', e); }
}

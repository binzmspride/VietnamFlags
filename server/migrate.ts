import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, flags } from "@shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

async function migrate() {
  try {
    console.log("🗄️ Running database migrations...");
    
    const client = await pool.connect();
    
    try {
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      
      // Create flags table
      await client.query(`
        CREATE TABLE IF NOT EXISTS flags (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          canvas_data TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      
      // Create session table for connect-pg-simple
      await client.query(`
        CREATE TABLE IF NOT EXISTS session (
          sid VARCHAR NOT NULL COLLATE "default",
          sess JSON NOT NULL,
          expire TIMESTAMP(6) NOT NULL
        )
      `);
      
      // Add primary key constraint if it doesn't exist
      try {
        await client.query(`
          ALTER TABLE session 
          ADD CONSTRAINT session_pkey 
          PRIMARY KEY (sid)
        `);
      } catch (e) {
        // Constraint already exists, ignore
      }
      
      // Create index on session expiration
      await client.query(`
        CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire)
      `);
      
      console.log("✅ Database migrations completed successfully!");
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
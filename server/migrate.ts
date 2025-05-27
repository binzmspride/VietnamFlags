import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users, flags } from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function migrate() {
  try {
    console.log("🗄️ Running database migrations...");
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create flags table
    await sql`
      CREATE TABLE IF NOT EXISTS flags (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        canvas_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create session table for connect-pg-simple
    await sql`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
      WITH (OIDS=FALSE)
    `;
    
    await sql`
      ALTER TABLE session 
      ADD CONSTRAINT session_pkey 
      PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE
    `;
    
    // Create index on session expiration
    await sql`
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire)
    `;
    
    console.log("✅ Database migrations completed successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
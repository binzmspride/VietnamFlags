import "dotenv/config";
import { users, flags, type User, type InsertUser, type Flag, type InsertFlag } from "@shared/schema";
import session from "express-session";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getUserFlags(userId: number): Promise<Flag[]>;
  createFlag(userId: number, flag: InsertFlag): Promise<Flag>;
  updateFlag(id: number, userId: number, flag: Partial<InsertFlag>): Promise<Flag | undefined>;
  deleteFlag(id: number, userId: number): Promise<boolean>;
  getFlag(id: number, userId: number): Promise<Flag | undefined>;

  sessionStore: any;
}

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getUserFlags(userId: number): Promise<Flag[]> {
    return await db.select().from(flags).where(eq(flags.userId, userId));
  }

  async createFlag(userId: number, insertFlag: InsertFlag): Promise<Flag> {
    const result = await db.insert(flags).values({
      ...insertFlag,
      userId,
    }).returning();
    return result[0];
  }

  async updateFlag(id: number, userId: number, flagData: Partial<InsertFlag>): Promise<Flag | undefined> {
    const result = await db
      .update(flags)
      .set({ ...flagData, updatedAt: new Date() })
      .where(eq(flags.id, id))
      .returning();
    
    // Check if the flag belongs to the user
    if (result.length > 0 && result[0].userId === userId) {
      return result[0];
    }
    return undefined;
  }

  async deleteFlag(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(flags)
      .where(eq(flags.id, id))
      .returning();
    
    // Check if the flag belonged to the user
    return result.length > 0 && result[0].userId === userId;
  }

  async getFlag(id: number, userId: number): Promise<Flag | undefined> {
    const result = await db
      .select()
      .from(flags)
      .where(eq(flags.id, id))
      .limit(1);
    
    // Check if the flag belongs to the user
    if (result.length > 0 && result[0].userId === userId) {
      return result[0];
    }
    return undefined;
  }
}

export const storage = new DatabaseStorage();

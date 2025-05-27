import { users, flags, type User, type InsertUser, type Flag, type InsertFlag } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private flags: Map<number, Flag>;
  currentUserId: number;
  currentFlagId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.flags = new Map();
    this.currentUserId = 1;
    this.currentFlagId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getUserFlags(userId: number): Promise<Flag[]> {
    return Array.from(this.flags.values()).filter(
      (flag) => flag.userId === userId
    );
  }

  async createFlag(userId: number, insertFlag: InsertFlag): Promise<Flag> {
    const id = this.currentFlagId++;
    const flag: Flag = {
      ...insertFlag,
      id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.flags.set(id, flag);
    return flag;
  }

  async updateFlag(id: number, userId: number, flagData: Partial<InsertFlag>): Promise<Flag | undefined> {
    const flag = this.flags.get(id);
    if (!flag || flag.userId !== userId) {
      return undefined;
    }
    
    const updatedFlag: Flag = {
      ...flag,
      ...flagData,
      updatedAt: new Date()
    };
    this.flags.set(id, updatedFlag);
    return updatedFlag;
  }

  async deleteFlag(id: number, userId: number): Promise<boolean> {
    const flag = this.flags.get(id);
    if (!flag || flag.userId !== userId) {
      return false;
    }
    
    return this.flags.delete(id);
  }

  async getFlag(id: number, userId: number): Promise<Flag | undefined> {
    const flag = this.flags.get(id);
    if (!flag || flag.userId !== userId) {
      return undefined;
    }
    return flag;
  }
}

export const storage = new MemStorage();

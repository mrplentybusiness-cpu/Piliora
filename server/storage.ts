import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { eq } from "drizzle-orm";
import { users, settings, type User, type InsertUser, type Setting, type InsertSetting, type SiteContent } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredentials(id: string, username: string, password: string): Promise<User | undefined>;
  
  // Settings methods
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  upsertSetting(key: string, value: any): Promise<Setting>;
  getSiteContent(): Promise<SiteContent | null>;
  updateSiteContent(content: Partial<SiteContent>): Promise<SiteContent>;
}

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const pool = new Pool({ connectionString });
    this.db = drizzle(pool);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserCredentials(id: string, username: string, password: string): Promise<User | undefined> {
    const result = await this.db
      .update(users)
      .set({ username, password })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    const result = await this.db.select().from(settings).where(eq(settings.key, key));
    return result[0];
  }

  async getAllSettings(): Promise<Setting[]> {
    return await this.db.select().from(settings);
  }

  async upsertSetting(key: string, value: any): Promise<Setting> {
    const existing = await this.getSetting(key);
    
    if (existing) {
      const result = await this.db
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return result[0];
    } else {
      const result = await this.db
        .insert(settings)
        .values({ key, value })
        .returning();
      return result[0];
    }
  }

  async getSiteContent(): Promise<SiteContent | null> {
    const setting = await this.getSetting('site_content');
    return setting ? (setting.value as SiteContent) : null;
  }

  async updateSiteContent(content: Partial<SiteContent>): Promise<SiteContent> {
    const existing = await this.getSiteContent();
    
    // Deep merge function to properly merge nested objects
    const deepMerge = (target: any, source: any): any => {
      const result = { ...target };
      for (const key of Object.keys(source)) {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
      return result;
    };
    
    const merged = existing ? deepMerge(existing, content) : content;
    const setting = await this.upsertSetting('site_content', merged);
    return setting.value as SiteContent;
  }
}

export const storage = new DatabaseStorage();

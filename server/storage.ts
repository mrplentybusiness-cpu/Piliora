import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { eq, desc } from "drizzle-orm";
import { users, settings, orders, type User, type InsertUser, type Setting, type InsertSetting, type SiteContent, type Order, type InsertOrder } from "@shared/schema";

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

  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string, trackingNumber?: string): Promise<Order | undefined>;
  updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  getOrderByStripeSessionId(sessionId: string): Promise<Order | undefined>;
}

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Configure SSL for production (Railway requires SSL)
    const isProduction = process.env.NODE_ENV === 'production';
    const pool = new Pool({ 
      connectionString,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    });
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

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await this.db.insert(orders).values(order).returning();
    return result[0];
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const result = await this.db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async getAllOrders(): Promise<Order[]> {
    return await this.db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: number, status: string, trackingNumber?: string): Promise<Order | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }
    const result = await this.db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined> {
    const result = await this.db
      .update(orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async deleteOrder(id: number): Promise<boolean> {
    const result = await this.db.delete(orders).where(eq(orders.id, id)).returning();
    return result.length > 0;
  }

  async getOrderByStripeSessionId(sessionId: string): Promise<Order | undefined> {
    const result = await this.db.select().from(orders).where(eq(orders.stripeSessionId, sessionId));
    return result[0];
  }
}

export const storage = new DatabaseStorage();

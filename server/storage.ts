import {
  users,
  investmentPlans,
  userInvestments,
  transactions,
  tradingActivities,
  systemSettings,
  type User,
  type UpsertUser,
  type InvestmentPlan,
  type InsertInvestmentPlan,
  type UserInvestment,
  type InsertUserInvestment,
  type Transaction,
  type InsertTransaction,
  type InsertTradingActivity,
  type SystemSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Investment plans
  getInvestmentPlans(): Promise<InvestmentPlan[]>;
  getInvestmentPlan(id: string): Promise<InvestmentPlan | undefined>;
  createInvestmentPlan(plan: InsertInvestmentPlan): Promise<InvestmentPlan>;
  updateInvestmentPlan(id: string, plan: Partial<InsertInvestmentPlan>): Promise<InvestmentPlan>;
  
  // User investments
  getUserInvestments(userId: string): Promise<(UserInvestment & { plan: InvestmentPlan })[]>;
  getActiveUserInvestments(userId: string): Promise<(UserInvestment & { plan: InvestmentPlan })[]>;
  createUserInvestment(investment: InsertUserInvestment): Promise<UserInvestment>;
  updateUserInvestment(id: string, investment: Partial<UserInvestment>): Promise<UserInvestment>;
  
  // Transactions
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Trading activities
  getRecentTradingActivities(limit?: number): Promise<any[]>;
  createTradingActivity(activity: InsertTradingActivity): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getUserStats(): Promise<{
    totalUsers: number;
    totalVolume: string;
    activePlans: number;
  }>;
  
  // System settings
  getSystemSettings(): Promise<SystemSettings | undefined>;
  updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings>;
  
  // Balance operations
  updateUserBalance(userId: string, amount: string): Promise<void>;
  addToUserBalance(userId: string, amount: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Investment plans
  async getInvestmentPlans(): Promise<InvestmentPlan[]> {
    return await db.select().from(investmentPlans).where(eq(investmentPlans.isActive, true));
  }
  
  async getInvestmentPlan(id: string): Promise<InvestmentPlan | undefined> {
    const [plan] = await db.select().from(investmentPlans).where(eq(investmentPlans.id, id));
    return plan;
  }
  
  async createInvestmentPlan(plan: InsertInvestmentPlan): Promise<InvestmentPlan> {
    const [newPlan] = await db.insert(investmentPlans).values(plan).returning();
    return newPlan;
  }
  
  async updateInvestmentPlan(id: string, plan: Partial<InsertInvestmentPlan>): Promise<InvestmentPlan> {
    const [updatedPlan] = await db
      .update(investmentPlans)
      .set({ ...plan, updatedAt: new Date() })
      .where(eq(investmentPlans.id, id))
      .returning();
    return updatedPlan;
  }
  
  // User investments
  async getUserInvestments(userId: string): Promise<(UserInvestment & { plan: InvestmentPlan })[]> {
    return await db
      .select()
      .from(userInvestments)
      .leftJoin(investmentPlans, eq(userInvestments.planId, investmentPlans.id))
      .where(eq(userInvestments.userId, userId))
      .orderBy(desc(userInvestments.createdAt));
  }
  
  async getActiveUserInvestments(userId: string): Promise<(UserInvestment & { plan: InvestmentPlan })[]> {
    return await db
      .select()
      .from(userInvestments)
      .leftJoin(investmentPlans, eq(userInvestments.planId, investmentPlans.id))
      .where(
        and(
          eq(userInvestments.userId, userId),
          eq(userInvestments.isActive, true)
        )
      )
      .orderBy(desc(userInvestments.createdAt));
  }
  
  async createUserInvestment(investment: InsertUserInvestment): Promise<UserInvestment> {
    const [newInvestment] = await db.insert(userInvestments).values(investment).returning();
    return newInvestment;
  }
  
  async updateUserInvestment(id: string, investment: Partial<UserInvestment>): Promise<UserInvestment> {
    const [updatedInvestment] = await db
      .update(userInvestments)
      .set({ ...investment, updatedAt: new Date() })
      .where(eq(userInvestments.id, id))
      .returning();
    return updatedInvestment;
  }
  
  // Transactions
  async getUserTransactions(userId: string, limit = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }
  
  // Trading activities
  async getRecentTradingActivities(limit = 10): Promise<any[]> {
    return await db
      .select()
      .from(tradingActivities)
      .orderBy(desc(tradingActivities.createdAt))
      .limit(limit);
  }
  
  async createTradingActivity(activity: InsertTradingActivity): Promise<void> {
    await db.insert(tradingActivities).values(activity);
  }
  
  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  
  async getUserStats(): Promise<{
    totalUsers: number;
    totalVolume: string;
    activePlans: number;
  }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [volumeResult] = await db.select({ 
      total: sql<string>`coalesce(sum(${users.totalInvested}), 0)` 
    }).from(users);
    const [activePlansCount] = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(userInvestments).where(eq(userInvestments.isActive, true));
    
    return {
      totalUsers: userCount.count,
      totalVolume: volumeResult.total,
      activePlans: activePlansCount.count,
    };
  }
  
  // System settings
  async getSystemSettings(): Promise<SystemSettings | undefined> {
    const [settings] = await db.select().from(systemSettings).where(eq(systemSettings.id, "system"));
    return settings;
  }
  
  async updateSystemSettings(settingsData: Partial<SystemSettings>): Promise<SystemSettings> {
    const [settings] = await db
      .insert(systemSettings)
      .values({ id: "system", ...settingsData, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: systemSettings.id,
        set: { ...settingsData, updatedAt: new Date() },
      })
      .returning();
    return settings;
  }
  
  // Balance operations
  async updateUserBalance(userId: string, amount: string): Promise<void> {
    await db
      .update(users)
      .set({ balance: amount, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
  
  async addToUserBalance(userId: string, amount: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        balance: sql`${users.balance} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();

import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  decimal,
  integer,
  boolean,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0.00"),
  totalInvested: decimal("total_invested", { precision: 12, scale: 2 }).default("0.00"),
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).default("0.00"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Investment plans
export const investmentPlans = pgTable("investment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  durationDays: integer("duration_days").notNull(),
  dailyRate: decimal("daily_rate", { precision: 5, scale: 4 }).notNull(), // e.g., 0.025 for 2.5%
  minInvestment: decimal("min_investment", { precision: 12, scale: 2 }).notNull(),
  maxInvestment: decimal("max_investment", { precision: 12, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User investments
export const userInvestments = pgTable("user_investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  planId: varchar("plan_id").references(() => investmentPlans.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }).notNull(),
  dailyEarnings: decimal("daily_earnings", { precision: 12, scale: 2 }).default("0.00"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  wasWithdrawnEarly: boolean("was_withdrawn_early").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // deposit, withdrawal, investment, earnings, early_withdrawal
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  status: varchar("status").default("completed"), // pending, completed, failed
  reference: varchar("reference"), // investment_id for related transactions
  createdAt: timestamp("created_at").defaultNow(),
});

// Trading activities (for AI trading simulation)
export const tradingActivities = pgTable("trading_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: varchar("symbol").notNull(), // BTC, ETH, ADA, etc.
  action: varchar("action").notNull(), // buy, sell, swap
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// System settings
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default("system"),
  pixGateway: varchar("pix_gateway").default("efi"), // efi or mercadopago
  settings: jsonb("settings"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  investments: many(userInvestments),
  transactions: many(transactions),
}));

export const investmentPlansRelations = relations(investmentPlans, ({ many }) => ({
  userInvestments: many(userInvestments),
}));

export const userInvestmentsRelations = relations(userInvestments, ({ one }) => ({
  user: one(users, {
    fields: [userInvestments.userId],
    references: [users.id],
  }),
  plan: one(investmentPlans, {
    fields: [userInvestments.planId],
    references: [investmentPlans.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertInvestmentPlan = typeof investmentPlans.$inferInsert;
export type InvestmentPlan = typeof investmentPlans.$inferSelect;

export type InsertUserInvestment = typeof userInvestments.$inferInsert;
export type UserInvestment = typeof userInvestments.$inferSelect;

export type InsertTransaction = typeof transactions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;

export type InsertTradingActivity = typeof tradingActivities.$inferInsert;
export type TradingActivity = typeof tradingActivities.$inferSelect;

export type SystemSettings = typeof systemSettings.$inferSelect;

// Schemas
export const insertInvestmentPlanSchema = createInsertSchema(investmentPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserInvestmentSchema = createInsertSchema(userInvestments).omit({
  id: true,
  currentValue: true,
  dailyEarnings: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

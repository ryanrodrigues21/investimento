import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertInvestmentPlanSchema, 
  insertUserInvestmentSchema,
  insertTransactionSchema 
} from "@shared/schema";
import { investmentService } from "./services/investmentService";
import { earningsCalculator } from "./services/earningsCalculator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const activeInvestments = await storage.getActiveUserInvestments(userId);
      const recentTransactions = await storage.getUserTransactions(userId, 5);
      const tradingActivities = await storage.getRecentTradingActivities(10);

      res.json({
        user,
        activeInvestments,
        recentTransactions,
        tradingActivities,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Investment plans routes
  app.get('/api/investment-plans', async (req, res) => {
    try {
      const plans = await storage.getInvestmentPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching investment plans:", error);
      res.status(500).json({ message: "Failed to fetch investment plans" });
    }
  });

  app.post('/api/investment-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const planData = insertInvestmentPlanSchema.parse(req.body);
      const plan = await storage.createInvestmentPlan(planData);
      res.json(plan);
    } catch (error) {
      console.error("Error creating investment plan:", error);
      res.status(500).json({ message: "Failed to create investment plan" });
    }
  });

  // User investments routes
  app.get('/api/investments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const investments = await storage.getUserInvestments(userId);
      res.json(investments);
    } catch (error) {
      console.error("Error fetching user investments:", error);
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  app.post('/api/investments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const investmentData = insertUserInvestmentSchema.parse({
        ...req.body,
        userId,
      });

      const result = await investmentService.createInvestment(userId, investmentData);
      res.json(result);
    } catch (error) {
      console.error("Error creating investment:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create investment" });
    }
  });

  app.post('/api/investments/:id/withdraw', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const investmentId = req.params.id;

      const result = await investmentService.earlyWithdrawal(userId, investmentId);
      res.json(result);
    } catch (error) {
      console.error("Error processing early withdrawal:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to process withdrawal" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions/deposit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount } = req.body;

      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Simulate PIX deposit (in real implementation, this would integrate with payment gateway)
      await storage.addToUserBalance(userId, amount);
      
      const transaction = await storage.createTransaction({
        userId,
        type: "deposit",
        amount,
        description: "Depósito PIX",
        status: "completed",
      });

      res.json(transaction);
    } catch (error) {
      console.error("Error processing deposit:", error);
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });

  app.post('/api/transactions/withdraw', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, pixKey } = req.body;

      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      if (!pixKey) {
        return res.status(400).json({ message: "PIX key is required" });
      }

      const user = await storage.getUser(userId);
      if (!user || parseFloat(user.balance) < parseFloat(amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Deduct from balance
      const newBalance = (parseFloat(user.balance) - parseFloat(amount)).toString();
      await storage.updateUserBalance(userId, newBalance);

      const transaction = await storage.createTransaction({
        userId,
        type: "withdrawal",
        amount: `-${amount}`,
        description: `Saque PIX para ${pixKey}`,
        status: "pending",
      });

      res.json(transaction);
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getUserStats();
      const systemSettings = await storage.getSystemSettings();
      
      res.json({
        ...stats,
        activeGateway: systemSettings?.pixGateway || "efi",
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settings = await storage.updateSystemSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Calculate earnings endpoint (for manual trigger)
  app.post('/api/admin/calculate-earnings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await earningsCalculator.calculateDailyEarnings();
      res.json({ message: "Earnings calculated successfully" });
    } catch (error) {
      console.error("Error calculating earnings:", error);
      res.status(500).json({ message: "Failed to calculate earnings" });
    }
  });

  // Trading activities for simulation
  app.get('/api/trading-activities', async (req, res) => {
    try {
      const activities = await storage.getRecentTradingActivities(10);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching trading activities:", error);
      res.status(500).json({ message: "Failed to fetch trading activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

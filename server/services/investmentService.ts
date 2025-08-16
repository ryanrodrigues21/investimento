import { storage } from "../storage";
import type { InsertUserInvestment } from "@shared/schema";

class InvestmentService {
  async createInvestment(userId: string, investmentData: InsertUserInvestment) {
    try {
      // Get user and plan details
      const user = await storage.getUser(userId);
      const plan = await storage.getInvestmentPlan(investmentData.planId);

      if (!user) {
        throw new Error("User not found");
      }

      if (!plan) {
        throw new Error("Investment plan not found");
      }

      const amount = parseFloat(investmentData.amount);
      const userBalance = parseFloat(user.balance);

      // Validate investment amount
      if (amount < parseFloat(plan.minInvestment)) {
        throw new Error(`Minimum investment is R$ ${plan.minInvestment}`);
      }

      if (amount > parseFloat(plan.maxInvestment)) {
        throw new Error(`Maximum investment is R$ ${plan.maxInvestment}`);
      }

      if (amount > userBalance) {
        throw new Error("Insufficient balance");
      }

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationDays);

      // Create investment
      const investment = await storage.createUserInvestment({
        ...investmentData,
        currentValue: investmentData.amount,
        endDate,
      });

      // Deduct amount from user balance
      const newBalance = (userBalance - amount).toString();
      await storage.updateUserBalance(userId, newBalance);

      // Update user total invested
      const newTotalInvested = (parseFloat(user.totalInvested || "0") + amount).toString();
      await storage.upsertUser({
        ...user,
        totalInvested: newTotalInvested,
      });

      // Create transaction record
      await storage.createTransaction({
        userId,
        type: "investment",
        amount: `-${amount}`,
        description: `Investimento no plano ${plan.name}`,
        status: "completed",
        reference: investment.id,
      });

      return investment;
    } catch (error) {
      console.error("Error in createInvestment:", error);
      throw error;
    }
  }

  async earlyWithdrawal(userId: string, investmentId: string) {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Get investment with plan details
      const userInvestments = await storage.getUserInvestments(userId);
      const investmentRecord = userInvestments.find(inv => inv.user_investments?.id === investmentId);

      if (!investmentRecord || !investmentRecord.user_investments) {
        throw new Error("Investment not found");
      }

      const investment = investmentRecord.user_investments;
      const plan = investmentRecord.investment_plans;

      if (!investment.isActive) {
        throw new Error("Investment is not active");
      }

      if (!plan) {
        throw new Error("Investment plan not found");
      }

      // For early withdrawal, user only gets back the original amount (loses all earnings)
      const originalAmount = parseFloat(investment.amount);

      // Update investment as withdrawn early
      await storage.updateUserInvestment(investmentId, {
        isActive: false,
        wasWithdrawnEarly: true,
      });

      // Add original amount back to user balance
      await storage.addToUserBalance(userId, originalAmount.toString());

      // Create transaction record
      await storage.createTransaction({
        userId,
        type: "early_withdrawal",
        amount: originalAmount.toString(),
        description: `Saque antecipado do plano ${plan.name} (perdeu rendimentos)`,
        status: "completed",
        reference: investmentId,
      });

      return {
        message: "Early withdrawal completed. Earnings were forfeited.",
        amount: originalAmount,
      };
    } catch (error) {
      console.error("Error in earlyWithdrawal:", error);
      throw error;
    }
  }
}

export const investmentService = new InvestmentService();

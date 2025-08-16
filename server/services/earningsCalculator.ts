import { storage } from "../storage";
import { eq, and } from "drizzle-orm";

class EarningsCalculator {
  async calculateDailyEarnings() {
    try {
      console.log("Starting daily earnings calculation...");

      // Get all active investments
      const allUsers = await storage.getAllUsers();
      
      for (const user of allUsers) {
        const activeInvestments = await storage.getActiveUserInvestments(user.id);
        
        let totalDailyEarnings = 0;

        for (const investmentRecord of activeInvestments) {
          if (!investmentRecord.user_investments || !investmentRecord.investment_plans) {
            continue;
          }

          const investment = investmentRecord.user_investments;
          const plan = investmentRecord.investment_plans;

          // Check if investment period has ended
          const now = new Date();
          const endDate = new Date(investment.endDate);
          
          if (now >= endDate) {
            // Investment has matured, finalize it
            await this.finalizeInvestment(investment.id, user.id);
            continue;
          }

          // Calculate daily earnings
          const currentValue = parseFloat(investment.currentValue);
          const dailyRate = parseFloat(plan.dailyRate);
          const dailyEarning = currentValue * dailyRate;

          // Update investment with new values
          const newCurrentValue = currentValue + dailyEarning;
          await storage.updateUserInvestment(investment.id, {
            currentValue: newCurrentValue.toString(),
            dailyEarnings: dailyEarning.toString(),
          });

          totalDailyEarnings += dailyEarning;

          // Create earnings transaction
          await storage.createTransaction({
            userId: user.id,
            type: "earnings",
            amount: dailyEarning.toString(),
            description: `Rendimento diário - ${plan.name}`,
            status: "completed",
            reference: investment.id,
          });
        }

        if (totalDailyEarnings > 0) {
          // Update user total earnings
          const currentTotalEarnings = parseFloat(user.totalEarnings || "0");
          const newTotalEarnings = (currentTotalEarnings + totalDailyEarnings).toString();
          
          await storage.upsertUser({
            ...user,
            totalEarnings: newTotalEarnings,
          });
        }
      }

      // Generate some random trading activities for simulation
      await this.generateTradingActivities();

      console.log("Daily earnings calculation completed");
    } catch (error) {
      console.error("Error calculating daily earnings:", error);
      throw error;
    }
  }

  private async finalizeInvestment(investmentId: string, userId: string) {
    try {
      // Get investment details
      const userInvestments = await storage.getUserInvestments(userId);
      const investmentRecord = userInvestments.find(inv => inv.user_investments?.id === investmentId);

      if (!investmentRecord || !investmentRecord.user_investments) {
        return;
      }

      const investment = investmentRecord.user_investments;
      const plan = investmentRecord.investment_plans;

      if (!plan) {
        return;
      }

      // Mark investment as completed
      await storage.updateUserInvestment(investmentId, {
        isActive: false,
      });

      // Add final value to user balance
      const finalValue = parseFloat(investment.currentValue);
      await storage.addToUserBalance(userId, finalValue.toString());

      // Create completion transaction
      await storage.createTransaction({
        userId,
        type: "investment_completion",
        amount: finalValue.toString(),
        description: `Finalização do investimento ${plan.name}`,
        status: "completed",
        reference: investmentId,
      });

      console.log(`Investment ${investmentId} finalized with value ${finalValue}`);
    } catch (error) {
      console.error("Error finalizing investment:", error);
    }
  }

  private async generateTradingActivities() {
    const activities = [
      { symbol: "BTC", action: "buy", percentage: "2.1" },
      { symbol: "ETH", action: "sell", percentage: "1.8" },
      { symbol: "ADA", action: "swap", percentage: "0.9" },
      { symbol: "SOL", action: "buy", percentage: "3.2" },
      { symbol: "DOT", action: "sell", percentage: "1.5" },
    ];

    // Generate 2-3 random activities
    const numActivities = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < numActivities; i++) {
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const percentage = (Math.random() * 3 + 0.5).toFixed(1); // 0.5% to 3.5%
      
      await storage.createTradingActivity({
        symbol: activity.symbol,
        action: activity.action,
        percentage,
      });
    }
  }
}

export const earningsCalculator = new EarningsCalculator();

// Schedule to run daily at midnight (in production, use node-cron or similar)
// For demo purposes, this can be triggered manually via admin endpoint

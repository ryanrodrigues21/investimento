import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import PortfolioChart from "@/components/portfolio-chart";
import { Wallet, ChartLine, Coins, Brain, ArrowUp, ArrowDown, ArrowLeftRight } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const { data: tradingActivities } = useQuery({
    queryKey: ["/api/trading-activities"],
    enabled: isAuthenticated,
  });

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue || 0);
  };

  const calculateTotalEarnings = () => {
    if (!dashboardData?.activeInvestments) return 0;
    return dashboardData.activeInvestments.reduce((total: number, inv: any) => {
      const currentValue = parseFloat(inv.user_investments?.currentValue || "0");
      const originalAmount = parseFloat(inv.user_investments?.amount || "0");
      return total + (currentValue - originalAmount);
    }, 0);
  };

  const calculateEarningsPercentage = () => {
    if (!dashboardData?.user?.totalInvested) return 0;
    const totalInvested = parseFloat(dashboardData.user.totalInvested);
    const totalEarnings = calculateTotalEarnings();
    return totalInvested > 0 ? (totalEarnings / totalInvested) * 100 : 0;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "buy":
        return <ArrowUp className="h-4 w-4 text-success" />;
      case "sell":
        return <ArrowDown className="h-4 w-4 text-orange-500" />;
      case "swap":
        return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      default:
        return <ArrowUp className="h-4 w-4 text-success" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "buy":
        return "bg-success/10";
      case "sell":
        return "bg-orange-50";
      case "swap":
        return "bg-blue-50";
      default:
        return "bg-success/10";
    }
  };

  if (isLoading || isDashboardLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-secondary" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Saldo Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData?.user?.balance || "0")}
                </p>
                <p className="text-sm text-secondary">
                  +{calculateEarningsPercentage().toFixed(1)}% este mês
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ChartLine className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Investido</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData?.user?.totalInvested || "0")}
                </p>
                <p className="text-sm text-primary">
                  {dashboardData?.activeInvestments?.length || 0} planos ativos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Coins className="h-6 w-6 text-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Rendimentos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(calculateTotalEarnings())}
                </p>
                <p className="text-sm text-success">
                  +{calculateEarningsPercentage().toFixed(1)}% de lucro
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">IA Trading</p>
                <p className="text-2xl font-bold text-gray-900">89,3%</p>
                <p className="text-sm text-success">Taxa de sucesso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Growth Chart & AI Trading Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <PortfolioChart />
        </div>
        
        {/* AI Trading Activity */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Atividade da IA</h3>
            <div className="space-y-4">
              {tradingActivities?.slice(0, 4).map((activity: any) => (
                <div key={activity.id} className={`flex items-center justify-between p-3 ${getActionColor(activity.action)} rounded-lg`}>
                  <div className="flex items-center">
                    {getActionIcon(activity.action)}
                    <div className="ml-3">
                      <p className="font-semibold text-sm">
                        {activity.action === "buy" ? "Compra" : 
                         activity.action === "sell" ? "Venda" : "Swap"} {activity.symbol}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(activity.createdAt).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-success font-semibold">
                    +{activity.percentage}%
                  </span>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-500 to-primary rounded-lg text-white">
                <div className="flex items-center">
                  <Brain className="h-6 w-6 mr-3" />
                  <div>
                    <p className="font-semibold">IA Performance</p>
                    <p className="text-sm opacity-90">Última hora: +4,8%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

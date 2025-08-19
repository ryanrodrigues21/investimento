import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sprout, Crown, Rocket, Calendar, TrendingUp, AlertTriangle } from "lucide-react";

const investmentSchema = z.object({
  planId: z.string().min(1, "Selecione um plano"),
  amount: z.string().min(1, "Digite o valor do investimento")
    .refine((val) => parseFloat(val) > 0, "Valor deve ser maior que zero"),
});

export default function Investments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isInvestDialogOpen, setIsInvestDialogOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/";
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const form = useForm<z.infer<typeof investmentSchema>>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      planId: "",
      amount: "",
    },
  });

  // Fetch investment plans
  const { data: plans } = useQuery({
    queryKey: ["/api/investment-plans"],
    enabled: isAuthenticated,
  });

  // Fetch user investments
  const { data: userInvestments, isLoading: isInvestmentsLoading } = useQuery({
    queryKey: ["/api/investments"],
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
    },
  });

  // Create investment mutation
  const createInvestmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof investmentSchema>) => {
      await apiRequest("POST", "/api/investments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsInvestDialogOpen(false);
      form.reset();
      toast({
        title: "Investimento realizado!",
        description: "Seu investimento foi criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar investimento.",
        variant: "destructive",
      });
    },
  });

  // Early withdrawal mutation
  const earlyWithdrawMutation = useMutation({
    mutationFn: async (investmentId: string) => {
      await apiRequest("POST", `/api/investments/${investmentId}/withdraw`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Saque realizado",
        description: "Saque antecipado processado. Os rendimentos foram perdidos.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Falha ao processar saque.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof investmentSchema>) => {
    createInvestmentMutation.mutate(data);
  };

  const handleInvest = (plan: any) => {
    setSelectedPlan(plan);
    form.setValue("planId", plan.id);
    setIsInvestDialogOpen(true);
  };

  const handleEarlyWithdraw = (investmentId: string) => {
    if (confirm("Tem certeza? Você perderá todos os rendimentos acumulados.")) {
      earlyWithdrawMutation.mutate(investmentId);
    }
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue || 0);
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  };

  const getPlanIcon = (name: string) => {
    if (name.toLowerCase().includes('starter')) return <Sprout className="h-8 w-8" />;
    if (name.toLowerCase().includes('premium')) return <Crown className="h-8 w-8" />;
    if (name.toLowerCase().includes('professional')) return <Rocket className="h-8 w-8" />;
    return <TrendingUp className="h-8 w-8" />;
  };

  if (isLoading || isInvestmentsLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeInvestments = userInvestments?.filter((inv: any) => inv.user_investments?.isActive) || [];
  const availablePlans = plans || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Planos de Investimento</h2>
        <p className="text-gray-600">Escolha o plano ideal para seus objetivos financeiros</p>
      </div>
      
      {/* Active Investments */}
      {activeInvestments.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Seus Investimentos Ativos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeInvestments.map((investment: any) => {
              const inv = investment.user_investments;
              const plan = investment.investment_plans;
              if (!inv || !plan) return null;

              const progress = calculateProgress(inv.startDate, inv.endDate);
              const daysRemaining = getDaysRemaining(inv.endDate);
              const currentValue = parseFloat(inv.currentValue || "0");
              const originalAmount = parseFloat(inv.amount || "0");
              const earnings = currentValue - originalAmount;

              return (
                <Card key={inv.id} className="border-2 border-secondary/20">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">{plan.name}</h4>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      </div>
                      <div className="flex items-center space-x-1 bg-success/10 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-xs text-success font-semibold">Ativo</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor Investido:</span>
                        <span className="font-semibold">{formatCurrency(inv.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor Atual:</span>
                        <span className="font-semibold text-primary">{formatCurrency(currentValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rendimento:</span>
                        <span className="font-semibold text-secondary">{formatCurrency(earnings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxa Diária:</span>
                        <span className="font-semibold text-primary">{plan.dailyRate}%</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progresso</span>
                        <span className="text-gray-600">{daysRemaining} dias restantes</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1" size="sm">
                        Detalhes
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 text-destructive border-destructive hover:bg-destructive/10" 
                        size="sm"
                        onClick={() => handleEarlyWithdraw(inv.id)}
                        disabled={earlyWithdrawMutation.isPending}
                      >
                        {earlyWithdrawMutation.isPending ? "..." : "Saque Antecipado"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Available Plans */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Novos Planos Disponíveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {availablePlans.map((plan: any, index: number) => {
            const isPopular = index === 1; // Make middle plan popular
            
            return (
              <Card 
                key={plan.id} 
                className={`${
                  isPopular 
                    ? "border-2 border-primary bg-gradient-to-br from-primary to-secondary text-white relative" 
                    : "border-2 hover:border-primary/50 transition-colors"
                }`}
              >
                <CardContent className="p-8">
                  {isPopular && (
                    <div className="absolute top-4 right-4 bg-accent text-dark px-3 py-1 rounded-full text-xs font-bold">
                      POPULAR
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 ${
                      isPopular ? "bg-white/20" : "bg-primary/10"
                    } rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <div className={isPopular ? "text-accent" : "text-primary"}>
                        {getPlanIcon(plan.name)}
                      </div>
                    </div>
                    <h4 className={`text-xl font-bold ${isPopular ? "text-white" : "text-gray-900"}`}>
                      {plan.name}
                    </h4>
                    <p className={isPopular ? "text-blue-100" : "text-gray-600"}>
                      {plan.description}
                    </p>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                      <span className={isPopular ? "text-blue-100" : "text-gray-600"}>Período:</span>
                      <span className="font-semibold">{plan.durationDays} dias</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isPopular ? "text-blue-100" : "text-gray-600"}>Taxa Diária:</span>
                      <span className={`font-semibold ${isPopular ? "text-accent" : "text-primary"}`}>
                        {parseFloat(plan.dailyRate).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isPopular ? "text-blue-100" : "text-gray-600"}>Investimento Mín:</span>
                      <span className="font-semibold">{formatCurrency(plan.minInvestment)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isPopular ? "text-blue-100" : "text-gray-600"}>Investimento Máx:</span>
                      <span className="font-semibold">{formatCurrency(plan.maxInvestment)}</span>
                    </div>
                    <div className={`flex justify-between items-center border-t pt-4 ${
                      isPopular ? "border-white/20" : "border-gray-200"
                    }`}>
                      <span className={isPopular ? "text-blue-100" : "text-gray-600"}>Retorno Estimado:</span>
                      <span className={`font-bold text-lg ${isPopular ? "text-accent" : "text-secondary"}`}>
                        {(parseFloat(plan.dailyRate) * plan.durationDays).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleInvest(plan)}
                    className={`w-full ${
                      isPopular 
                        ? "bg-white text-primary hover:bg-gray-100" 
                        : "bg-primary text-white hover:bg-primary/90"
                    }`}
                  >
                    Investir Agora
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Investment Dialog */}
      <Dialog open={isInvestDialogOpen} onOpenChange={setIsInvestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fazer Investimento</DialogTitle>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedPlan.name}</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Período:</span>
                    <span>{selectedPlan.durationDays} dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa Diária:</span>
                    <span>{parseFloat(selectedPlan.dailyRate).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investimento:</span>
                    <span>{formatCurrency(selectedPlan.minInvestment)} - {formatCurrency(selectedPlan.maxInvestment)}</span>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor do Investimento</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min={selectedPlan.minInvestment}
                            max={selectedPlan.maxInvestment}
                            placeholder={`Min: ${formatCurrency(selectedPlan.minInvestment)}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <strong>Importante:</strong> Saque antecipado resultará na perda de todos os rendimentos acumulados.
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsInvestDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={createInvestmentMutation.isPending}
                    >
                      {createInvestmentMutation.isPending ? "Processando..." : "Confirmar Investimento"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
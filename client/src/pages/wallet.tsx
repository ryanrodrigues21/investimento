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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TransactionHistory from "@/components/transaction-history";
import { Wallet, Plus, Minus, Copy, QrCode, Info, CreditCard } from "lucide-react";

const depositSchema = z.object({
  amount: z.string().min(1, "Digite o valor do depósito")
    .refine((val) => parseFloat(val) > 0, "Valor deve ser maior que zero"),
});

const withdrawSchema = z.object({
  amount: z.string().min(1, "Digite o valor do saque")
    .refine((val) => parseFloat(val) > 0, "Valor deve ser maior que zero"),
  pixKey: z.string().min(1, "Digite sua chave PIX"),
});

export default function WalletPage() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

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

  const depositForm = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: "",
    },
  });

  const withdrawForm = useForm<z.infer<typeof withdrawSchema>>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: "",
      pixKey: "",
    },
  });

  // Fetch transactions
  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions"],
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

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: z.infer<typeof depositSchema>) => {
      await apiRequest("POST", "/api/transactions/deposit", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsDepositDialogOpen(false);
      depositForm.reset();
      toast({
        title: "Depósito realizado!",
        description: "Seu depósito foi processado com sucesso.",
      });
    },
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
      toast({
        title: "Erro",
        description: error.message || "Falha ao processar depósito.",
        variant: "destructive",
      });
    },
  });

  // Withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: z.infer<typeof withdrawSchema>) => {
      await apiRequest("POST", "/api/transactions/withdraw", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsWithdrawDialogOpen(false);
      withdrawForm.reset();
      toast({
        title: "Saque solicitado!",
        description: "Seu saque foi solicitado e será processado em até 24h.",
      });
    },
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
      toast({
        title: "Erro",
        description: error.message || "Falha ao processar saque.",
        variant: "destructive",
      });
    },
  });

  const onDepositSubmit = (data: z.infer<typeof depositSchema>) => {
    depositMutation.mutate(data);
  };

  const onWithdrawSubmit = (data: z.infer<typeof withdrawSchema>) => {
    withdrawMutation.mutate(data);
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue || 0);
  };

  const copyPixKey = async () => {
    const pixKey = "investpro@pay.com.br";
    try {
      await navigator.clipboard.writeText(pixKey);
      toast({
        title: "Copiado!",
        description: "Chave PIX copiada para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a chave PIX.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Carteira Digital</h2>
        <p className="text-gray-600">Gerencie seus depósitos e saques</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wallet Balance & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-8 text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-blue-100 mb-2">Saldo Disponível</p>
                <p className="text-4xl font-bold">{formatCurrency(user?.balance || "0")}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100 mb-2">Total Investido</p>
                <p className="text-xl font-semibold">{formatCurrency(user?.totalInvested || "0")}</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 bg-white/20 backdrop-blur text-white hover:bg-white/30 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Depositar
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 bg-white/20 backdrop-blur text-white hover:bg-white/30 transition-colors">
                    <Minus className="h-4 w-4 mr-2" />
                    Sacar
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
          
          {/* Transaction History */}
          <TransactionHistory transactions={transactions || []} />
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-6">
          {/* PIX Payment Options */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Depósito PIX</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Chave PIX</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyPixKey}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                    investpro@pay.com.br
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">QR Code PIX</p>
                  <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                    <QrCode className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Info className="h-4 w-4 inline mr-2" />
                    Depósitos são processados automaticamente em até 5 minutos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Gateway Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Gateway de Pagamento</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Efi Pay</p>
                  <p className="text-sm text-gray-600">Sistema ativo</p>
                </div>
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fazer Depósito</DialogTitle>
          </DialogHeader>
          
          <Form {...depositForm}>
            <form onSubmit={depositForm.handleSubmit(onDepositSubmit)} className="space-y-4">
              <FormField
                control={depositForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Depósito</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="R$ 0,00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Info className="h-4 w-4 inline mr-2" />
                  Este é um depósito simulado para demonstração. Em produção, seria integrado com PIX real.
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDepositDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={depositMutation.isPending}
                >
                  {depositMutation.isPending ? "Processando..." : "Confirmar Depósito"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Saque</DialogTitle>
          </DialogHeader>
          
          <Form {...withdrawForm}>
            <form onSubmit={withdrawForm.handleSubmit(onWithdrawSubmit)} className="space-y-4">
              <FormField
                control={withdrawForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Saque</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="1"
                        max={parseFloat(user?.balance || "0")}
                        placeholder="R$ 0,00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={withdrawForm.control}
                name="pixKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave PIX</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Digite sua chave PIX"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <p className="text-sm text-amber-800">
                  <Info className="h-4 w-4 inline mr-2" />
                  Saques são processados em até 24h úteis
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsWithdrawDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? "Processando..." : "Solicitar Saque"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

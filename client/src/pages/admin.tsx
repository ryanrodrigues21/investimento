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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  ChartLine, 
  Coins, 
  CreditCard, 
  Search, 
  Eye, 
  Edit, 
  Ban,
  Plus,
  Settings,
  TrendingUp,
  Activity
} from "lucide-react";

const planSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  durationDays: z.string().min(1, "Duração é obrigatória")
    .refine((val) => parseInt(val) > 0, "Duração deve ser maior que zero"),
  dailyRate: z.string().min(1, "Taxa diária é obrigatória")
    .refine((val) => parseFloat(val) > 0, "Taxa deve ser maior que zero"),
  minInvestment: z.string().min(1, "Investimento mínimo é obrigatório")
    .refine((val) => parseFloat(val) > 0, "Valor deve ser maior que zero"),
  maxInvestment: z.string().min(1, "Investimento máximo é obrigatório")
    .refine((val) => parseFloat(val) > 0, "Valor deve ser maior que zero"),
});

const settingsSchema = z.object({
  pixGateway: z.enum(["efi", "mercadopago"]),
});

export default function AdminPage() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isCreatePlanDialogOpen, setIsCreatePlanDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa de permissões de administrador.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const planForm = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      durationDays: "",
      dailyRate: "",
      minInvestment: "",
      maxInvestment: "",
    },
  });

  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      pixGateway: "efi",
    },
  });

  // Fetch admin stats
  const { data: adminStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.isAdmin,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
    },
  });

  // Fetch users
  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.isAdmin,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
    },
  });

  // Fetch investment plans
  const { data: plans } = useQuery({
    queryKey: ["/api/investment-plans"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (data: z.infer<typeof planSchema>) => {
      await apiRequest("POST", "/api/investment-plans", {
        ...data,
        durationDays: parseInt(data.durationDays),
        dailyRate: (parseFloat(data.dailyRate) / 100).toString(), // Convert percentage to decimal
        minInvestment: data.minInvestment,
        maxInvestment: data.maxInvestment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investment-plans"] });
      setIsCreatePlanDialogOpen(false);
      planForm.reset();
      toast({
        title: "Plano criado!",
        description: "Novo plano de investimento foi criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar plano.",
        variant: "destructive",
      });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof settingsSchema>) => {
      await apiRequest("POST", "/api/admin/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Configurações atualizadas!",
        description: "As configurações do sistema foram salvas.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar configurações.",
        variant: "destructive",
      });
    },
  });

  // Calculate earnings mutation
  const calculateEarningsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/calculate-earnings", {});
    },
    onSuccess: () => {
      toast({
        title: "Rendimentos calculados!",
        description: "Os rendimentos diários foram calculados manualmente.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/";
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Falha ao calcular rendimentos.",
        variant: "destructive",
      });
    },
  });

  const onPlanSubmit = (data: z.infer<typeof planSchema>) => {
    createPlanMutation.mutate(data);
  };

  const onSettingsSubmit = (data: z.infer<typeof settingsSchema>) => {
    updateSettingsMutation.mutate(data);
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue || 0);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName) return "U";
    const first = firstName.charAt(0).toUpperCase();
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";
    return first + last;
  };

  const filteredUsers = users?.filter((user: any) =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Set initial settings value
  useEffect(() => {
    if (adminStats?.activeGateway) {
      settingsForm.setValue("pixGateway", adminStats.activeGateway);
    }
  }, [adminStats, settingsForm]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h2>
        <p className="text-gray-600">Gerencie usuários, planos e configurações do sistema</p>
      </div>
      
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats?.totalUsers || 0}</p>
                <p className="text-sm text-success">+{users?.length || 0} total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <ChartLine className="h-6 w-6 text-secondary" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Volume Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(adminStats?.totalVolume || "0")}</p>
                <p className="text-sm text-success">Investimentos</p>
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
                <p className="text-sm text-gray-600">Planos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats?.activePlans || 0}</p>
                <p className="text-sm text-primary">{plans?.length || 0} tipos disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Gateway Ativo</p>
                <p className="text-lg font-bold text-gray-900">
                  {adminStats?.activeGateway === "efi" ? "Efi Pay" : "Mercado Pago"}
                </p>
                <p className="text-sm text-success">Funcionando</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Admin Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200 px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="users">Usuários</TabsTrigger>
                <TabsTrigger value="plans">Planos</TabsTrigger>
                <TabsTrigger value="transactions">Transações</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>
            </div>
            
            {/* Users Tab */}
            <TabsContent value="users" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Gerenciar Usuários</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar usuário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-3 text-gray-600">Usuário</th>
                      <th className="pb-3 text-gray-600">Email</th>
                      <th className="pb-3 text-gray-600">Saldo</th>
                      <th className="pb-3 text-gray-600">Total Investido</th>
                      <th className="pb-3 text-gray-600">Status</th>
                      <th className="pb-3 text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user: any) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-sm font-semibold">
                                {getInitials(user.firstName, user.lastName)}
                              </span>
                            </div>
                            <span className="font-semibold">
                              {user.firstName} {user.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-600">{user.email}</td>
                        <td className="py-4 font-semibold">{formatCurrency(user.balance || "0")}</td>
                        <td className="py-4 font-semibold">{formatCurrency(user.totalInvested || "0")}</td>
                        <td className="py-4">
                          <span className="bg-success/10 text-success px-2 py-1 rounded-full text-xs font-semibold">
                            Ativo
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Ban className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            {/* Plans Tab */}
            <TabsContent value="plans" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Planos de Investimento</h3>
                <Dialog open={isCreatePlanDialogOpen} onOpenChange={setIsCreatePlanDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Plano
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans?.map((plan: any) => (
                  <Card key={plan.id} className="border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">{plan.name}</h4>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                        <div className="flex items-center space-x-1 bg-success/10 px-2 py-1 rounded-full">
                          <div className="w-2 h-2 bg-success rounded-full"></div>
                          <span className="text-xs text-success font-semibold">Ativo</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Duração:</span>
                          <span>{plan.durationDays} dias</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa Diária:</span>
                          <span>{(parseFloat(plan.dailyRate) * 100).toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Min/Max:</span>
                          <span>{formatCurrency(plan.minInvestment)} - {formatCurrency(plan.maxInvestment)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Transactions Tab */}
            <TabsContent value="transactions" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Transações do Sistema</h3>
                <Button
                  onClick={() => calculateEarningsMutation.mutate()}
                  disabled={calculateEarningsMutation.isPending}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  {calculateEarningsMutation.isPending ? "Calculando..." : "Calcular Rendimentos"}
                </Button>
              </div>
              
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Relatório de transações em desenvolvimento</p>
              </div>
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings" className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Configurações do Sistema</h3>
              
              <div className="max-w-md">
                <Form {...settingsForm}>
                  <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                    <FormField
                      control={settingsForm.control}
                      name="pixGateway"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gateway PIX Ativo</FormLabel>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                id="efi"
                                {...field}
                                value="efi"
                                checked={field.value === "efi"}
                                className="w-4 h-4 text-primary"
                              />
                              <label htmlFor="efi" className="text-sm font-medium">
                                Efi Pay (Gerencianet)
                              </label>
                            </div>
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                id="mercadopago"
                                {...field}
                                value="mercadopago"
                                checked={field.value === "mercadopago"}
                                className="w-4 h-4 text-primary"
                              />
                              <label htmlFor="mercadopago" className="text-sm font-medium">
                                Mercado Pago
                              </label>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {updateSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Plan Dialog */}
      <Dialog open={isCreatePlanDialogOpen} onOpenChange={setIsCreatePlanDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Plano</DialogTitle>
          </DialogHeader>
          
          <Form {...planForm}>
            <form onSubmit={planForm.handleSubmit(onPlanSubmit)} className="space-y-4">
              <FormField
                control={planForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Plano</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Starter" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={planForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Descrição do plano" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={planForm.control}
                  name="durationDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (dias)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={planForm.control}
                  name="dailyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa Diária (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="1.5" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={planForm.control}
                  name="minInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investimento Mínimo</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="500.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={planForm.control}
                  name="maxInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investimento Máximo</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="5000.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsCreatePlanDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createPlanMutation.isPending}
                >
                  {createPlanMutation.isPending ? "Criando..." : "Criar Plano"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
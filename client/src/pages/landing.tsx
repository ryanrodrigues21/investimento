import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChartLine, Shield, Zap, Users, TrendingUp, Award } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
});

export default function Landing() {
  const { toast } = useToast();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      await apiRequest("POST", "/api/login", data);
    },
    onSuccess: () => {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof registerSchema>) => {
      await apiRequest("POST", "/api/register", data);
    },
    onSuccess: () => {
      toast({
        title: "Conta criada!",
        description: "Sua conta foi criada com sucesso!",
      });
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen trading-bg">
      {/* Header */}
      <header className="trading-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center glow-effect">
                <ChartLine className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="ml-3 text-xl font-bold text-foreground">CryptoPro Exchange</span>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 glow-effect">
                    Entrar
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Cadastrar
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Trade Crypto com{" "}
              <span className="text-gradient">IA Avançada</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Exchange profissional de criptomoedas com algoritmos de trading quantitativo. 
              Maximize seus lucros com nossa tecnologia institucional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-lg px-8 py-4 glow-effect"
                  >
                    Começar Trading
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4 border-border text-foreground hover:bg-muted"
              >
                API Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Por que CryptoPro Exchange?
            </h2>
            <p className="text-xl text-muted-foreground">
              Tecnologia institucional para traders profissionais
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="trading-card hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Algoritmos Quantitativos</h3>
                <p className="text-muted-foreground">
                  Algoritmos de HFT e market making operando 24/7 nos principais 
                  mercados cripto com 94,7% de win rate.
                </p>
              </CardContent>
            </Card>

            <Card className="trading-card hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Cold Storage</h3>
                <p className="text-muted-foreground">
                  98% dos ativos em cold storage multi-sig com segurança militar. 
                  Auditado por Certik e segurado até $500M.
                </p>
              </CardContent>
            </Card>

            <Card className="trading-card hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Liquidez Profunda</h3>
                <p className="text-muted-foreground">
                  Market making com $2.8B em liquidez. Spreads ultra baixos 
                  e execução instantânea para grandes volumes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2 trading-number">$2.8B</div>
              <div className="text-muted-foreground">Volume Diário</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2 trading-number">847,392</div>
              <div className="text-muted-foreground">Traders Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2 trading-number">0.05%</div>
              <div className="text-muted-foreground">Spread Médio</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2 trading-number">&lt; 10ms</div>
              <div className="text-muted-foreground">Latência Média</div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Preview */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Planos de Trading
            </h2>
            <p className="text-xl text-muted-foreground">
              Escolha a estratégia ideal para seu perfil de risco
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Conservative Plan */}
            <Card className="trading-card hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Conservative</h3>
                  <p className="text-muted-foreground">Baixo risco, retorno estável</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estratégia:</span>
                    <span className="font-semibold text-foreground">Market Making</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retorno Anual:</span>
                    <span className="font-semibold text-bull trading-number">12-18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Drawdown:</span>
                    <span className="font-bold text-neutral trading-number">&lt; 5%</span>
                  </div>
                </div>
                
                <Button onClick={handleLogin} className="w-full">
                  Ativar Estratégia
                </Button>
              </CardContent>
            </Card>

            {/* Aggressive Plan */}
            <Card className="trading-card border-primary bg-gradient-to-br from-primary/20 to-secondary/20 relative">
              <CardContent className="p-8">
                <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold">
                  MAIS POPULAR
                </div>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Aggressive</h3>
                  <p className="text-muted-foreground">Alto retorno, risco controlado</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estratégia:</span>
                    <span className="font-semibold text-foreground">Momentum + Arbitrage</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retorno Anual:</span>
                    <span className="font-semibold text-bull trading-number">45-85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Drawdown:</span>
                    <span className="font-bold text-neutral trading-number">&lt; 15%</span>
                  </div>
                </div>
                
                <Button onClick={handleLogin} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Ativar Estratégia
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="trading-card hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Professional</h3>
                  <p className="text-muted-foreground">HFT e derivativos</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estratégia:</span>
                    <span className="font-semibold text-foreground">HFT + Options</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retorno Anual:</span>
                    <span className="font-semibold text-bull trading-number">120-300%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Drawdown:</span>
                    <span className="font-bold text-bear trading-number">&lt; 25%</span>
                  </div>
                </div>
                
                <Button onClick={handleLogin} className="w-full">
                  Ativar Estratégia
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <ChartLine className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-foreground">CryptoPro Exchange</span>
              </div>
              <p className="text-muted-foreground">
                Exchange profissional de criptomoedas com tecnologia institucional.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white">Planos</a></li>
                <li><a href="#" className="hover:text-white">Segurança</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Conecte-se</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600">
                  <span className="text-sm">TG</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600">
                  <span className="text-sm">WA</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600">
                  <span className="text-sm">IG</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CryptoPro Exchange. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Entrar na sua conta</DialogTitle>
          </DialogHeader>
          
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="seu@email.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="••••••••" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsLoginOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Entrando..." : "Entrar"}
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Não tem conta?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => {
                      setIsLoginOpen(false);
                      setIsRegisterOpen(true);
                    }}
                  >
                    Cadastre-se
                  </button>
                </p>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar nova conta</DialogTitle>
          </DialogHeader>
          
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={registerForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="João" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Silva" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="seu@email.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="••••••••" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsRegisterOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Criando..." : "Criar Conta"}
                </Button>
              </div>
    </div>
  );
}

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Já tem conta?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => {
                      setIsRegisterOpen(false);
                      setIsLoginOpen(true);
                    }}
                  >
                    Entrar
                  </button>
                </p>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
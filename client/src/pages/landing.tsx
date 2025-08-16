import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartLine, Shield, Zap, Users, TrendingUp, Award } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ChartLine className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">InvestPro</span>
            </div>
            <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
              Fazer Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Invista com{" "}
              <span className="text-gradient">Inteligência Artificial</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Plataforma completa de investimentos digitais com IA de trading avançada. 
              Maximize seus rendimentos com nossa tecnologia de ponta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleLogin}
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
              >
                Começar a Investir
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4"
              >
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o InvestPro?
            </h2>
            <p className="text-xl text-gray-600">
              Tecnologia avançada para maximizar seus investimentos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">IA de Trading</h3>
                <p className="text-gray-600">
                  Nossa inteligência artificial opera 24/7 nos mercados de criptomoedas 
                  com 89,3% de taxa de sucesso.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Segurança Total</h3>
                <p className="text-gray-600">
                  Seus investimentos são protegidos com criptografia de nível bancário 
                  e múltiplas camadas de segurança.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-4">Rendimentos Diários</h3>
                <p className="text-gray-600">
                  Receba rendimentos calculados diariamente com transparência 
                  total sobre suas operações.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">R$ 2.4M+</div>
              <div className="text-gray-600">Volume Total Investido</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">1,247</div>
              <div className="text-gray-600">Investidores Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">89.3%</div>
              <div className="text-gray-600">Taxa de Sucesso IA</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600">Operação Contínua</div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Planos de Investimento
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para seus objetivos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Starter</h3>
                  <p className="text-gray-600">Ideal para iniciantes</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Período:</span>
                    <span className="font-semibold">30 dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa Diária:</span>
                    <span className="font-semibold text-primary">1,5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retorno Estimado:</span>
                    <span className="font-bold text-secondary text-lg">45%</span>
                  </div>
                </div>
                
                <Button onClick={handleLogin} className="w-full">
                  Investir Agora
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-primary bg-gradient-to-br from-primary to-secondary text-white">
              <CardContent className="p-8">
                <div className="absolute top-4 right-4 bg-accent text-dark px-3 py-1 rounded-full text-xs font-bold">
                  POPULAR
                </div>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold">Premium</h3>
                  <p className="text-blue-100">Para investidores experientes</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className="text-blue-100">Período:</span>
                    <span className="font-semibold">90 dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Taxa Diária:</span>
                    <span className="font-semibold text-accent">2,5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Retorno Estimado:</span>
                    <span className="font-bold text-accent text-lg">225%</span>
                  </div>
                </div>
                
                <Button onClick={handleLogin} className="w-full bg-white text-primary hover:bg-gray-100">
                  Investir Agora
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold">Professional</h3>
                  <p className="text-gray-600">Máximo retorno</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Período:</span>
                    <span className="font-semibold">180 dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa Diária:</span>
                    <span className="font-semibold text-primary">3,2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retorno Estimado:</span>
                    <span className="font-bold text-secondary text-lg">576%</span>
                  </div>
                </div>
                
                <Button onClick={handleLogin} className="w-full">
                  Investir Agora
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
                <span className="ml-3 text-xl font-bold">InvestPro</span>
              </div>
              <p className="text-gray-400">
                Plataforma de investimentos digitais com IA de trading avançada.
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
            <p>&copy; 2024 InvestPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

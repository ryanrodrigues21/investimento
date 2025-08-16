import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sprout, 
  Crown, 
  Rocket, 
  TrendingUp,
  Calendar,
  Percent,
  DollarSign,
  Target
} from "lucide-react";

interface InvestmentCardProps {
  plan: {
    id: string;
    name: string;
    description: string;
    durationDays: number;
    dailyRate: string;
    minInvestment: string;
    maxInvestment: string;
  };
  isPopular?: boolean;
  onInvest: (plan: any) => void;
}

export default function InvestmentCard({ plan, isPopular = false, onInvest }: InvestmentCardProps) {
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue || 0);
  };

  const getPlanIcon = (name: string) => {
    if (name.toLowerCase().includes('starter')) return <Sprout className="h-8 w-8" />;
    if (name.toLowerCase().includes('premium')) return <Crown className="h-8 w-8" />;
    if (name.toLowerCase().includes('professional')) return <Rocket className="h-8 w-8" />;
    return <TrendingUp className="h-8 w-8" />;
  };

  const calculateEstimatedReturn = () => {
    const dailyRate = parseFloat(plan.dailyRate);
    const days = plan.durationDays;
    return (dailyRate * days * 100).toFixed(0);
  };

  return (
    <Card 
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className={`h-4 w-4 ${isPopular ? "text-blue-100" : "text-gray-600"}`} />
              <span className={isPopular ? "text-blue-100" : "text-gray-600"}>Período:</span>
            </div>
            <span className="font-semibold">{plan.durationDays} dias</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Percent className={`h-4 w-4 ${isPopular ? "text-blue-100" : "text-gray-600"}`} />
              <span className={isPopular ? "text-blue-100" : "text-gray-600"}>Taxa Diária:</span>
            </div>
            <span className={`font-semibold ${isPopular ? "text-accent" : "text-primary"}`}>
              {(parseFloat(plan.dailyRate) * 100).toFixed(2)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className={`h-4 w-4 ${isPopular ? "text-blue-100" : "text-gray-600"}`} />
              <span className={isPopular ? "text-blue-100" : "text-gray-600"}>Investimento Mín:</span>
            </div>
            <span className="font-semibold">{formatCurrency(plan.minInvestment)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className={`h-4 w-4 ${isPopular ? "text-blue-100" : "text-gray-600"}`} />
              <span className={isPopular ? "text-blue-100" : "text-gray-600"}>Investimento Máx:</span>
            </div>
            <span className="font-semibold">{formatCurrency(plan.maxInvestment)}</span>
          </div>
          
          <div className={`flex items-center justify-between border-t pt-4 ${
            isPopular ? "border-white/20" : "border-gray-200"
          }`}>
            <div className="flex items-center space-x-2">
              <Target className={`h-4 w-4 ${isPopular ? "text-blue-100" : "text-gray-600"}`} />
              <span className={isPopular ? "text-blue-100" : "text-gray-600"}>Retorno Estimado:</span>
            </div>
            <span className={`font-bold text-lg ${isPopular ? "text-accent" : "text-secondary"}`}>
              {calculateEstimatedReturn()}%
            </span>
          </div>
        </div>
        
        <Button 
          onClick={() => onInvest(plan)}
          className={`w-full ${
            isPopular 
              ? "bg-white text-primary hover:bg-gray-100" 
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          Investir Agora
        </Button>
        
        {isPopular && (
          <div className="mt-4 text-center">
            <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
              Mais Escolhido
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

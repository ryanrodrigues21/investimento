import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  TrendingUp, 
  Coins,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  status: string;
  createdAt: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Math.abs(numValue) || 0);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (isToday) {
      return `Hoje, ${timeStr}`;
    } else if (isYesterday) {
      return `Ontem, ${timeStr}`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownCircle className="h-5 w-5 text-success" />;
      case "withdrawal":
      case "early_withdrawal":
        return <ArrowUpCircle className="h-5 w-5 text-orange-500" />;
      case "investment":
        return <TrendingUp className="h-5 w-5 text-primary" />;
      case "earnings":
      case "investment_completion":
        return <Coins className="h-5 w-5 text-accent" />;
      default:
        return <ArrowDownCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "earnings":
      case "investment_completion":
        return "bg-success/10 border-success/20";
      case "withdrawal":
      case "early_withdrawal":
        return "bg-orange-50 border-orange-200";
      case "investment":
        return "bg-primary/10 border-primary/20";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Depósito PIX";
      case "withdrawal":
        return "Saque";
      case "early_withdrawal":
        return "Saque Antecipado";
      case "investment":
        return "Investimento";
      case "earnings":
        return "Rendimento Diário";
      case "investment_completion":
        return "Finalização de Investimento";
      default:
        return "Transação";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Confirmado";
      case "pending":
        return "Pendente";
      case "failed":
        return "Falhou";
      default:
        return "Desconhecido";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const isPositiveTransaction = (type: string, amount: string) => {
    const positiveTypes = ["deposit", "earnings", "investment_completion"];
    return positiveTypes.includes(type) || parseFloat(amount) > 0;
  };

  if (!transactions.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Histórico de Transações</h3>
          <div className="text-center py-12 text-gray-500">
            <Coins className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma transação encontrada</p>
            <p className="text-sm">Suas transações aparecerão aqui</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Histórico de Transações</h3>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const isPositive = isPositiveTransaction(transaction.type, transaction.amount);
            
            return (
              <div 
                key={transaction.id} 
                className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                  getTransactionColor(transaction.type)
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-semibold">{getTransactionTypeLabel(transaction.type)}</p>
                    <p className="text-sm text-gray-600">{formatDateTime(transaction.createdAt)}</p>
                    {transaction.description && (
                      <p className="text-xs text-gray-500 mt-1">{transaction.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    isPositive ? "text-success" : "text-destructive"
                  }`}>
                    {isPositive ? "+" : ""}{formatCurrency(transaction.amount)}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    {getStatusIcon(transaction.status)}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(transaction.status)}`}
                    >
                      {getStatusLabel(transaction.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {transactions.length >= 10 && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Mostrando as últimas {transactions.length} transações
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

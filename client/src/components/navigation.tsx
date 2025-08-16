import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ChartLine, Wallet, TrendingUp, History, Settings } from "lucide-react";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const formatCurrency = (value: string | undefined) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName) return "U";
    const first = firstName.charAt(0).toUpperCase();
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";
    return first + last;
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ChartLine className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">InvestPro</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="/">
                <a className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                  isActive("/") 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/investments">
                <a className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                  isActive("/investments") 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
                  Investimentos
                </a>
              </Link>
              <Link href="/wallet">
                <a className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                  isActive("/wallet") 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
                  Carteira
                </a>
              </Link>
              {user?.isAdmin && (
                <Link href="/admin">
                  <a className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                    isActive("/admin") 
                      ? "border-primary text-primary" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}>
                    Admin
                  </a>
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg">
              <Wallet className="h-4 w-4 text-secondary" />
              <span className="text-sm font-semibold">
                {formatCurrency(user?.balance)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {getInitials(user?.firstName, user?.lastName)}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="ghost" onClick={handleLogout} className="text-sm">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

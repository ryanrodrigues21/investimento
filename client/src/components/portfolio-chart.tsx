import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PortfolioChart() {
  const chartData = [
    { month: 'Jan', value: 15000 },
    { month: 'Fev', value: 16200 },
    { month: 'Mar', value: 17800 },
    { month: 'Abr', value: 16900 },
    { month: 'Mai', value: 20300 },
    { month: 'Jun', value: 23100 },
    { month: 'Jul', value: 25847 },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Evolução do Portfolio</h3>
          <div className="flex space-x-2">
            <Button size="sm" className="bg-primary text-white">7D</Button>
            <Button size="sm" variant="outline">30D</Button>
            <Button size="sm" variant="outline">90D</Button>
          </div>
        </div>
        
        <div className="h-80 relative">
          <svg className="w-full h-full" viewBox="0 0 800 300">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((line) => (
              <line
                key={line}
                x1="60"
                y1={60 + (line * 50)}
                x2="740"
                y2={60 + (line * 50)}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}
            
            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4].map((index) => (
              <text
                key={index}
                x="40"
                y={70 + (index * 50)}
                fontSize="12"
                fill="#6b7280"
                textAnchor="end"
              >
                R$ {Math.round(maxValue - ((maxValue - minValue) * index / 4) / 1000)}k
              </text>
            ))}
            
            {/* Chart line */}
            <path
              d={chartData.map((point, index) => {
                const x = 60 + (index * (680 / (chartData.length - 1)));
                const y = 260 - ((point.value - minValue) / (maxValue - minValue)) * 200;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Fill area under curve */}
            <path
              d={`${chartData.map((point, index) => {
                const x = 60 + (index * (680 / (chartData.length - 1)));
                const y = 260 - ((point.value - minValue) / (maxValue - minValue)) * 200;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')} L 740 260 L 60 260 Z`}
              fill="url(#gradient)"
              opacity="0.1"
            />
            
            {/* Data points */}
            {chartData.map((point, index) => {
              const x = 60 + (index * (680 / (chartData.length - 1)));
              const y = 260 - ((point.value - minValue) / (maxValue - minValue)) * 200;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="hsl(var(--primary))"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
            
            {/* X-axis labels */}
            {chartData.map((point, index) => (
              <text
                key={index}
                x={60 + (index * (680 / (chartData.length - 1)))}
                y="285"
                fontSize="12"
                fill="#6b7280"
                textAnchor="middle"
              >
                {point.month}
              </text>
            ))}
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

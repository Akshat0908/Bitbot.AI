import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

interface TransactionStatsProps {
  transactions: any[];
}

export const TransactionStats = ({ transactions }: TransactionStatsProps) => {
  const totalTxs = transactions.length;
  const successfulTxs = transactions.filter(tx => tx.tx_status === 'success').length;
  const failedTxs = transactions.filter(tx => tx.tx_status === 'failed').length;
  const transferTxs = transactions.filter(tx => 
    tx.tx_type.includes('transfer')
  ).length;

  const successRate = totalTxs > 0 ? ((successfulTxs / totalTxs) * 100).toFixed(1) : '0';

  const totalFees = transactions.reduce((sum, tx) => {
    return sum + (parseInt(tx.fee_rate) || 0);
  }, 0);

  const stats = [
    {
      title: "Total Transactions",
      value: totalTxs,
      icon: Activity,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Transfers",
      value: transferTxs,
      icon: TrendingDown,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Total Fees",
      value: `${(totalFees / 1000000).toFixed(2)} STX`,
      icon: DollarSign,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    }
  ];

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="p-6 bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
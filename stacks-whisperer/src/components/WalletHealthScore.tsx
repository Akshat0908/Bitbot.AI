import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

interface WalletHealthScoreProps {
  transactions: any[];
}

export const WalletHealthScore = ({ transactions }: WalletHealthScoreProps) => {
  if (transactions.length === 0) {
    return null;
  }

  // Calculate health score based on various factors
  const successRate = transactions.filter(tx => tx.tx_status === 'success').length / transactions.length;
  const hasRecentActivity = transactions.length > 0;
  const failedRate = transactions.filter(tx => tx.tx_status === 'failed').length / transactions.length;

  let score = 0;
  
  // Success rate contributes 50%
  score += successRate * 50;
  
  // Activity contributes 30%
  if (hasRecentActivity) score += 30;
  
  // Low failed rate contributes 20%
  if (failedRate < 0.1) score += 20;
  else if (failedRate < 0.2) score += 10;

  const getHealthStatus = (score: number) => {
    if (score >= 85) return { label: "Excellent", color: "text-green-500", icon: CheckCircle2 };
    if (score >= 70) return { label: "Good", color: "text-blue-500", icon: Shield };
    if (score >= 50) return { label: "Fair", color: "text-yellow-500", icon: AlertTriangle };
    return { label: "Needs Attention", color: "text-red-500", icon: AlertTriangle };
  };

  const status = getHealthStatus(score);
  const StatusIcon = status.icon;

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Wallet Health Score</h3>
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${status.color}`} />
          <span className={`font-semibold ${status.color}`}>{status.label}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall Score</span>
            <span className="text-2xl font-bold">{Math.round(score)}/100</span>
          </div>
          <Progress value={score} className="h-3" />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Success Rate</p>
            <p className="text-lg font-semibold">{(successRate * 100).toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total TXs</p>
            <p className="text-lg font-semibold">{transactions.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Failed</p>
            <p className="text-lg font-semibold">{(failedRate * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionDisplayProps {
  transactions: any[];
  isAnalyzing: boolean;
}

export const TransactionDisplay = ({ transactions, isAnalyzing }: TransactionDisplayProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (txType: string) => {
    if (txType.includes('token_transfer') || txType.includes('stx_transfer')) {
      return <ArrowUpRight className="w-4 h-4" />;
    }
    return <ArrowDownLeft className="w-4 h-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50 h-[600px] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 pb-4 border-b border-border/50">
        Transaction History
      </h2>

      <div className="flex-1 overflow-y-auto space-y-3">
        {isAnalyzing && transactions.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading transactions...</p>
          </div>
        )}

        {!isAnalyzing && transactions.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p>No transactions yet</p>
            <p className="text-sm mt-2">Enter a wallet address to get started</p>
          </div>
        )}

        {transactions.map((tx, index) => (
          <Card
            key={tx.tx_id || index}
            className={cn(
              "p-4 bg-background/50 border-border/50 hover:border-primary/50 transition-all cursor-pointer",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-full",
                    tx.tx_type.includes('transfer') ? "bg-primary/20" : "bg-accent/20"
                  )}>
                    {getTransactionIcon(tx.tx_type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {tx.tx_type.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(tx.burn_block_time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    Block: {tx.block_height}
                  </Badge>
                  <Badge 
                    variant={tx.tx_status === 'success' ? 'default' : 'destructive'}
                    className="text-xs flex items-center gap-1"
                  >
                    {getStatusIcon(tx.tx_status)}
                    {tx.tx_status}
                  </Badge>
                  {tx.fee_rate && (
                    <Badge variant="secondary" className="text-xs">
                      Fee: {tx.fee_rate} μSTX
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground font-mono truncate">
                  {tx.tx_id}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};

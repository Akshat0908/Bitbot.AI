import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TransactionChartProps {
  transactions: any[];
}

export const TransactionChart = ({ transactions }: TransactionChartProps) => {
  if (transactions.length === 0) {
    return null;
  }

  // Group transactions by date
  const chartData = transactions.reduce((acc: any[], tx) => {
    const date = new Date(tx.burn_block_time * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ date, count: 1 });
    }
    return acc;
  }, []).reverse();

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Transaction Activity</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
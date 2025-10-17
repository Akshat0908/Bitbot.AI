import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bitcoin, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HeroProps {
  walletAddress: string;
  setWalletAddress: (address: string) => void;
  setTransactions: (transactions: any[]) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export const Hero = ({ walletAddress, setWalletAddress, setTransactions, setIsAnalyzing }: HeroProps) => {
  const handleAnalyze = async () => {
    if (!walletAddress.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }

    setIsAnalyzing(true);
    toast.loading("Fetching transactions...");

    try {
      const { data, error } = await supabase.functions.invoke('fetch-transactions', {
        body: { address: walletAddress }
      });

      if (error) throw error;

      if (data?.transactions) {
        setTransactions(data.transactions);
        toast.dismiss();
        toast.success(`Found ${data.transactions.length} transactions!`);
      } else {
        throw new Error("No transaction data received");
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.dismiss();
      toast.error("Failed to fetch transactions. Please check the wallet address.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="text-center space-y-8 animate-fade-in">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="relative">
          <Bitcoin className="w-16 h-16 text-primary animate-pulse" />
          <Sparkles className="w-6 h-6 text-accent absolute -top-1 -right-1 animate-pulse" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          BitBot.AI
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered Bitcoin wallet assistant. Analyze Stacks transactions and chat naturally to understand your blockchain activity.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex gap-3">
          <Input
            placeholder="Enter Stacks wallet address (e.g., SP...)"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="flex-1 bg-card/50 border-border/50 focus:border-primary transition-all"
          />
          <Button 
            onClick={handleAnalyze}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            Analyze
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Try: SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
        </p>
      </div>
    </div>
  );
};

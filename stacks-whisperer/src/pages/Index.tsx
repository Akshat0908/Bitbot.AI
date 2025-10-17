import { useState } from "react";
import { Hero } from "@/components/Hero";
import { ChatInterface } from "@/components/ChatInterface";
import { TransactionDisplay } from "@/components/TransactionDisplay";
import { TransactionStats } from "@/components/TransactionStats";
import { TransactionChart } from "@/components/TransactionChart";
import { WalletHealthScore } from "@/components/WalletHealthScore";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const Index = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <DarkModeToggle />
        </div>
        
        <Hero 
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          setTransactions={setTransactions}
          setIsAnalyzing={setIsAnalyzing}
        />
        
        {transactions.length > 0 && (
          <div className="mt-12 space-y-6">
            <TransactionStats transactions={transactions} />
            
            <div className="grid lg:grid-cols-2 gap-6">
              <TransactionChart transactions={transactions} />
              <WalletHealthScore transactions={transactions} />
            </div>
          </div>
        )}
        
        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          <TransactionDisplay 
            transactions={transactions}
            isAnalyzing={isAnalyzing}
          />
          <ChatInterface 
            walletAddress={walletAddress}
            transactions={transactions}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;

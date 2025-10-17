import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  walletAddress: string;
  transactions: any[];
}

export const ChatInterface = ({ walletAddress, transactions }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!walletAddress) {
      toast.error("Please analyze a wallet first");
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-wallet', {
        body: { 
          messages: [...messages, userMessage],
          transactionData: transactions.length > 0 ? transactions : null
        }
      });

      if (error) throw error;

      if (data?.analysis) {
        const assistantMessage: Message = { 
          role: "assistant", 
          content: data.analysis 
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50 flex flex-col h-[600px]">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
        <Bot className="w-6 h-6 text-accent" />
        <h2 className="text-xl font-semibold">Chat with BitBot</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <Bot className="w-12 h-12 mx-auto mb-4 text-accent/50" />
            <p>Ask me anything about your wallet transactions!</p>
            <p className="text-sm mt-2">Try: "Explain my last 3 transactions"</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3 animate-fade-in",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-accent" />
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-3 max-w-[80%]",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-accent animate-pulse" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-muted/50">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-accent/50 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-accent/50 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-accent/50 animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 pt-4 border-t border-border/50">
        <Input
          placeholder="Ask about your transactions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading || !walletAddress}
          className="bg-background/50"
        />
        <Button 
          onClick={handleSend} 
          disabled={isLoading || !input.trim() || !walletAddress}
          size="icon"
          className="bg-gradient-to-r from-primary to-accent"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

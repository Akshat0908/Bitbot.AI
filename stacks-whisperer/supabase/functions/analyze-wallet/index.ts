import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, transactionData } = await req.json();
    
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    console.log('Analyzing wallet with AI via OpenRouter...');

    // Build the system prompt for financial analysis
    const systemPrompt = `You are BitBot.AI, an expert Bitcoin and Stacks blockchain analyst.
Your role is to analyze wallet transactions and provide clear, insightful explanations.

Key responsibilities:
- Explain transaction patterns and wallet activity
- Identify trends in transaction behavior
- Provide wallet health assessments based on transaction data
- Answer questions about specific transactions
- Explain transaction types, fees, and status
- Provide security insights and recommendations

When analyzing wallet health:
- High success rate (>95%) indicates excellent wallet management
- Failed transactions may suggest network issues or insufficient funds
- Regular transaction activity shows an active, engaged wallet
- Low fees suggest efficient transaction timing

Guidelines:
- Be conversational and friendly
- Explain technical concepts simply
- Use specific transaction data when available
- Provide actionable insights
- Keep responses concise but informative

Current wallet context:
${transactionData && transactionData.length > 0 ? `- Total transactions: ${transactionData.length}
- Success rate: ${((transactionData.filter((tx: any) => tx.tx_status === 'success').length / transactionData.length) * 100).toFixed(1)}%
- Transaction types: ${[...new Set(transactionData.map((tx: any) => tx.tx_type))].join(', ')}` : 'No transaction data available yet'}
`;


    // Prepare messages for AI
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []),
    ];

    // If transaction data is provided, add it as context
    if (transactionData && transactionData.length > 0) {
      aiMessages.push({
        role: "user",
        content: `Here are the wallet transactions to analyze:\n\n${JSON.stringify(transactionData, null, 2)}\n\nPlease provide a clear summary and insights about this wallet's activity.`
      });
    }

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://bitbot.ai",
        "X-Title": "BitBot.AI"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: aiMessages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices?.[0]?.message?.content;

    console.log('AI analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        analysis: aiResponse,
        model: "openai/gpt-4o-mini"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-wallet:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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
    const { address } = await req.json();
    
    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Wallet address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const STACKS_API_KEY = Deno.env.get("STACKS_API_KEY");
    if (!STACKS_API_KEY) {
      throw new Error("STACKS_API_KEY is not configured");
    }

    console.log('Fetching transactions for address:', address);

    // Fetch transactions from Stacks API
    const stacksResponse = await fetch(
      `https://api.hiro.so/extended/v1/address/${address}/transactions?limit=10`,
      {
        headers: {
          'Accept': 'application/json',
          'x-api-key': STACKS_API_KEY,
        },
      }
    );

    if (!stacksResponse.ok) {
      console.error('Stacks API error:', stacksResponse.status);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch transactions from Stacks network',
          details: await stacksResponse.text()
        }),
        { status: stacksResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await stacksResponse.json();
    console.log('Successfully fetched transactions:', data.results?.length || 0);

    return new Response(
      JSON.stringify({ 
        transactions: data.results || [],
        total: data.total || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-transactions:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

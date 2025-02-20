
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Get workspace function running")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN');
    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('Missing Asana access token');
    }

    // 1. أولاً نقوم بجلب قائمة المحافظ
    console.log('🔄 Fetching portfolios list from Asana...');
    
    const portfoliosResponse = await fetch(
      'https://app.asana.com/api/1.0/portfolios',
      {
        headers: {
          'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!portfoliosResponse.ok) {
      const errorText = await portfoliosResponse.text();
      console.error('❌ Error fetching portfolios list:', errorText);
      throw new Error(`Asana API error: ${errorText}`);
    }

    const portfoliosData = await portfoliosResponse.json();
    console.log('✅ Successfully fetched portfolios:', portfoliosData);
    
    return new Response(
      JSON.stringify({ portfolios: portfoliosData.data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error in get-workspace function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
})

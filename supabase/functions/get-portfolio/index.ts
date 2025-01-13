import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const { portfolioId } = await req.json()

    console.log('Fetching portfolio with ID:', portfolioId)

    if (!portfolioId) {
      console.error('No portfolio ID provided')
      throw new Error('معرف المحفظة مطلوب')
    }

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    if (!portfolio) {
      console.error('Portfolio not found:', portfolioId)
      return new Response(
        JSON.stringify({ 
          error: 'لم يتم العثور على المحفظة' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    console.log('Successfully fetched portfolio:', portfolio)

    return new Response(
      JSON.stringify(portfolio),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in get-portfolio function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'حدث خطأ أثناء جلب بيانات المحفظة'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
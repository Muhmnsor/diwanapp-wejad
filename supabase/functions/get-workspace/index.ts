import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Get workspace function running")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ASANA_ACCESS_TOKEN = Deno.env.get('ASANA_ACCESS_TOKEN')
    
    if (!ASANA_ACCESS_TOKEN) {
      throw new Error('Asana access token not configured')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { workspaceId } = await req.json()
    console.log('Fetching workspace details for ID:', workspaceId)

    // First get portfolios from Asana
    const portfoliosResponse = await fetch(`https://app.asana.com/api/1.0/portfolios?workspace=${workspaceId}&opt_fields=name,color,created_at,current_status,due_on,members,owner,permalink_url,public,start_on,workspace,gid,resource_type`, {
      headers: {
        'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    })

    if (!portfoliosResponse.ok) {
      console.error('Error fetching portfolios:', await portfoliosResponse.text())
      throw new Error('فشل في جلب المحافظ من Asana')
    }

    const portfoliosData = await portfoliosResponse.json()
    console.log('Asana portfolios:', portfoliosData)

    // For each portfolio from Asana
    for (const portfolio of portfoliosData.data) {
      // Check if portfolio exists in database
      const { data: existingPortfolio, error: findError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('asana_gid', portfolio.gid)
        .maybeSingle()

      if (findError) {
        console.error('Error checking portfolio:', findError)
        continue
      }

      const portfolioData = {
        name: portfolio.name,
        description: portfolio.current_status?.text || '',
        asana_gid: portfolio.gid,
        asana_sync_enabled: true,
        updated_at: new Date().toISOString()
      }

      if (!existingPortfolio) {
        // Insert new portfolio
        const { error: insertError } = await supabase
          .from('portfolios')
          .insert({
            ...portfolioData,
            created_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error inserting portfolio:', insertError)
        }
      } else {
        // Update existing portfolio
        const { error: updateError } = await supabase
          .from('portfolios')
          .update(portfolioData)
          .eq('asana_gid', portfolio.gid)

        if (updateError) {
          console.error('Error updating portfolio:', updateError)
        }
      }
    }

    // Get updated portfolios from database
    const { data: updatedPortfolios, error: dbError } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('Error fetching updated portfolios:', dbError)
      throw dbError
    }

    console.log('Successfully synced portfolios:', updatedPortfolios)
    return new Response(
      JSON.stringify({
        portfolios: updatedPortfolios
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in get-workspace function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
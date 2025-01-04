import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { template, variables } = await req.json()
    console.log('Validating template:', { template, variables })

    // Basic template validation logic
    const requiredVariables = template.match(/\{\{([^}]+)\}\}/g) || []
    const missingVariables = requiredVariables.filter(
      variable => !variables.hasOwnProperty(variable.replace(/[{}]/g, ''))
    )

    const response = {
      isValid: missingVariables.length === 0,
      missingVariables,
      processedTemplate: template.replace(
        /\{\{([^}]+)\}\}/g,
        (match, variable) => variables[variable] || match
      )
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error validating template:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
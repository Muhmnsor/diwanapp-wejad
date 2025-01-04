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

    // Find all placeholders in the template using regex
    const placeholderRegex = /\[([^\]]+)\]/g
    const requiredVariables = Array.from(template.matchAll(placeholderRegex))
      .map(match => match[1])

    // Check for missing variables
    const missingVariables = requiredVariables.filter(
      variable => !variables.hasOwnProperty(variable)
    )

    // Process the template by replacing variables
    let processedTemplate = template
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `[${key}]`
      processedTemplate = processedTemplate.replaceAll(placeholder, value as string)
    })

    const response = {
      isValid: missingVariables.length === 0,
      missingVariables,
      processedTemplate
    }

    console.log('Validation result:', response)

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
      JSON.stringify({ 
        error: error.message,
        isValid: false,
        missingVariables: [],
        processedTemplate: null
      }),
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
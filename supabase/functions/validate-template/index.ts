
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { template, variables } = await req.json()

    if (!template) {
      throw new Error('Template is required')
    }

    console.log('Validating template:', template)
    console.log('With variables:', variables)

    // Regular expression to find variable placeholders like {{variable_name}}
    const variableRegex = /\{\{([^}]+)\}\}/g
    const requiredVariables = []
    let match

    // Find all required variables in the template
    while ((match = variableRegex.exec(template)) !== null) {
      requiredVariables.push(match[1])
    }

    console.log('Required variables:', requiredVariables)

    // Check if all required variables are provided
    const missingVariables = requiredVariables.filter(
      variable => !variables || variables[variable] === undefined
    )

    const isValid = missingVariables.length === 0

    return new Response(
      JSON.stringify({
        isValid,
        requiredVariables,
        missingVariables,
        message: isValid ? 'Template is valid' : 'Missing required variables'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error validating template:', error)

    return new Response(
      JSON.stringify({
        error: error.message,
        isValid: false
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

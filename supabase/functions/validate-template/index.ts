
import { corsHeaders } from '../_shared/cors.ts'

interface TemplateValidationRequest {
  template: string;
  variables: Record<string, string>;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { template, variables } = await req.json() as TemplateValidationRequest

    // Validate that we have a template
    if (!template) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No template content provided'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log('Validating template:', { 
      templateLength: template.length,
      variablesCount: Object.keys(variables || {}).length
    })

    // Find all variables in the template (pattern: {{variable_name}})
    const variableRegex = /{{([^{}]+)}}/g
    const matches = Array.from(template.matchAll(variableRegex))
    const templateVariables = matches.map(match => match[1])

    // Identify missing variables (variables in template but not in provided variables)
    const missingVariables = templateVariables.filter(
      variable => !variables || !Object.prototype.hasOwnProperty.call(variables, variable)
    )

    // Replace variables in template
    let processedTemplate = template
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        processedTemplate = processedTemplate.replace(
          new RegExp(`{{${key}}}`, 'g'), 
          value || '[placeholder]'
        )
      })
    }

    // Check if there are still any unreplaced variables
    const unreplacedVariables = Array.from(processedTemplate.matchAll(variableRegex))
    
    // Build the response
    const response = {
      isValid: missingVariables.length === 0 && unreplacedVariables.length === 0,
      templateVariables,
      missingVariables,
      unreplacedVariables: unreplacedVariables.map(match => match[1]),
      processedTemplate
    }

    console.log('Template validation result:', { 
      isValid: response.isValid,
      templateVariablesCount: templateVariables.length,
      missingVariablesCount: missingVariables.length
    })

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error validating template:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

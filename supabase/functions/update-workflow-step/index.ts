
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestData {
  requestId: string;
  currentStepId: string;
  action: 'approve' | 'reject' | 'complete';
  metadata?: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const requestData: RequestData = await req.json()
    
    console.log('Processing workflow step update:', requestData)
    
    // Input validation
    if (!requestData.requestId || !requestData.currentStepId || !requestData.action) {
      throw new Error('Missing required fields: requestId, currentStepId, and action are required')
    }
    
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Get the request and current step
    const { data: requestData1, error: requestError } = await supabaseAdmin
      .from('requests')
      .select(`
        *,
        workflow_id,
        current_step_id,
        current_step:workflow_steps!inner(id, step_order, step_type)
      `)
      .eq('id', requestData.requestId)
      .single()
    
    if (requestError) {
      throw new Error(`Error fetching request: ${requestError.message}`)
    }
    
    // If the current step is an opinion step, we need to find the next step in the workflow
    if (requestData1.current_step.step_type === 'opinion') {
      console.log('Current step is an opinion step. Finding next step in workflow...')
      
      // Get the next step in the workflow
      const { data: nextStep, error: nextStepError } = await supabaseAdmin
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', requestData1.workflow_id)
        .gt('step_order', requestData1.current_step.step_order)
        .order('step_order', { ascending: true })
        .limit(1)
        .single()
      
      if (nextStepError) {
        console.log('No next step found, workflow may be complete:', nextStepError)
        
        // If there's no next step, mark the request as completed
        const { data: updatedRequest, error: updateError } = await supabaseAdmin
          .from('requests')
          .update({ 
            status: 'completed',
            current_step_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', requestData.requestId)
          .select()
        
        if (updateError) {
          throw new Error(`Error completing request: ${updateError.message}`)
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Request completed successfully',
            data: updatedRequest
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('Next step found:', nextStep)
      
      // Update the request to the next step
      const { data: updatedRequest, error: updateError } = await supabaseAdmin
        .from('requests')
        .update({ 
          current_step_id: nextStep.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestData.requestId)
        .select()
      
      if (updateError) {
        throw new Error(`Error updating request to next step: ${updateError.message}`)
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Request updated to next step successfully',
          data: updatedRequest
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // For decision steps, the workflow progression is handled by the approve_request and reject_request functions
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'No action needed for decision step',
        data: null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error processing workflow step update:', error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

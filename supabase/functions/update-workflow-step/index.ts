
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestData {
  requestId: string;
  currentStepId: string;
  action: 'approve' | 'reject' | 'complete';
  metadata?: Record<string, any>;
}

interface NextStepResult {
  id: string | null;
  step_order: number | null;
  step_type: string | null;
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
    
    // Get the request with full details about current step
    const { data: requestData1, error: requestError } = await supabaseAdmin
      .from('requests')
      .select(`
        id,
        workflow_id,
        current_step_id,
        current_step:workflow_steps!inner(id, step_order, step_type)
      `)
      .eq('id', requestData.requestId)
      .single()
    
    if (requestError) {
      throw new Error(`Error fetching request: ${requestError.message}`)
    }
    
    console.log('Found request with details:', requestData1)
    
    // For both opinion and decision steps, we find the next step in the workflow
    console.log('Finding next step in workflow...')
    
    // Get the next step in the workflow based on step_order
    const { data: nextStep, error: nextStepError } = await supabaseAdmin
      .from('workflow_steps')
      .select('id, step_order, step_type')
      .eq('workflow_id', requestData1.workflow_id)
      .gt('step_order', requestData1.current_step.step_order)
      .order('step_order', { ascending: true })
      .limit(1)
      .single()
    
    let nextStepResult: NextStepResult = {
      id: null,
      step_order: null,
      step_type: null
    }
    
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
          data: updatedRequest,
          next_step: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Next step found:', nextStep)
    nextStepResult = nextStep
    
    // For opinion steps, we need to update the request to the next step 
    // but we do not change the request status, just move to next step
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
        data: updatedRequest,
        next_step: nextStepResult
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

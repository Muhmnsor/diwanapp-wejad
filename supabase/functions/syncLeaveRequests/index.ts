
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get request body
    const { record, type } = await req.json()

    // We're only interested in request approvals that relate to leave requests
    if (!record || !record.request_id) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid request data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Get request details
    const { data: requestData, error: requestError } = await supabase
      .from('requests')
      .select(`
        id,
        request_type_id,
        status,
        form_data,
        request_types:request_type_id(name)
      `)
      .eq('id', record.request_id)
      .single()

    if (requestError) throw requestError

    // Check if this is a leave request
    const requestTypeName = requestData.request_types?.name || ''
    if (!requestTypeName.toLowerCase().includes('leave') && !requestTypeName.toLowerCase().includes('إجازة')) {
      return new Response(JSON.stringify({ success: true, message: 'Not a leave request' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Extract leave request data from form_data
    const formData = requestData.form_data || {}
    
    if (!formData.employee_id || !formData.leave_type || !formData.start_date || !formData.end_date) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required leave request fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Check if this request has already been synced
    const { data: existingData, error: checkError } = await supabase
      .from('hr_leave_requests')
      .select('id')
      .eq('request_id', requestData.id)
      .maybeSingle()

    if (checkError) throw checkError

    let leaveRequestId: string

    if (existingData) {
      // Update existing leave request
      const { data: updateData, error: updateError } = await supabase
        .from('hr_leave_requests')
        .update({
          status: requestData.status,
          start_date: formData.start_date,
          end_date: formData.end_date,
          leave_type: formData.leave_type,
          reason: formData.reason || null
        })
        .eq('id', existingData.id)
        .select()
        .single()

      if (updateError) throw updateError
      leaveRequestId = updateData.id
    } else {
      // Create new leave request
      const { data: insertData, error: insertError } = await supabase
        .from('hr_leave_requests')
        .insert({
          request_id: requestData.id,
          employee_id: formData.employee_id,
          leave_type: formData.leave_type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason || null,
          status: requestData.status
        })
        .select()
        .single()

      if (insertError) throw insertError
      leaveRequestId = insertData.id
    }

    // If the request is approved, update leave entitlements
    if (requestData.status === 'approved') {
      // Calculate days
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      // Get leave type ID
      const { data: leaveTypeData, error: leaveTypeError } = await supabase
        .from('hr_leave_types')
        .select('id')
        .eq('name', formData.leave_type)
        .single()

      if (leaveTypeError) throw leaveTypeError

      // Get current entitlement
      const year = new Date().getFullYear()
      const { data: entitlementData, error: entitlementError } = await supabase
        .from('hr_leave_entitlements')
        .select('*')
        .eq('employee_id', formData.employee_id)
        .eq('leave_type_id', leaveTypeData.id)
        .eq('year', year)
        .maybeSingle()

      if (entitlementError) throw entitlementError

      if (entitlementData) {
        // Update existing entitlement
        const { error: updateEntitlementError } = await supabase
          .from('hr_leave_entitlements')
          .update({
            used_days: entitlementData.used_days + days,
            remaining_days: entitlementData.total_days - (entitlementData.used_days + days)
          })
          .eq('id', entitlementData.id)

        if (updateEntitlementError) throw updateEntitlementError
      } else {
        // Get default leave days
        const { data: leaveTypeDetails, error: detailsError } = await supabase
          .from('hr_leave_types')
          .select('max_days_per_year')
          .eq('id', leaveTypeData.id)
          .single()

        if (detailsError) throw detailsError

        // Create new entitlement
        const totalDays = leaveTypeDetails.max_days_per_year || 0
        const { error: insertEntitlementError } = await supabase
          .from('hr_leave_entitlements')
          .insert({
            employee_id: formData.employee_id,
            leave_type_id: leaveTypeData.id,
            year: year,
            total_days: totalDays,
            used_days: days,
            remaining_days: totalDays - days
          })

        if (insertEntitlementError) throw insertEntitlementError
      }
    }

    return new Response(JSON.stringify({ success: true, leaveRequestId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error syncing leave request:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

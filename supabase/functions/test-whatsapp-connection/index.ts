import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

console.log("Test WhatsApp Connection function started")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log("Received request body:", {
      ...body,
      api_key: body.api_key ? "***" : undefined // Hide API key in logs
    })

    const { business_phone, api_key, account_id, whatsapp_number_id } = body

    // Validate required fields
    const missingFields = []
    if (!business_phone) missingFields.push('business_phone')
    if (!api_key) missingFields.push('api_key')
    if (!account_id) missingFields.push('account_id')
    if (!whatsapp_number_id) missingFields.push('whatsapp_number_id')

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      return new Response(
        JSON.stringify({ 
          error: 'جميع الحقول مطلوبة',
          missing_fields: missingFields 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Test connection to WhatsApp API
    console.log("Testing WhatsApp API connection for number ID:", whatsapp_number_id)
    const response = await fetch(`https://graph.facebook.com/v17.0/${whatsapp_number_id}`, {
      headers: {
        'Authorization': `Bearer ${api_key}`,
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('WhatsApp API error:', error)
      return new Response(
        JSON.stringify({ error: 'فشل الاتصال بواجهة برمجة تطبيقات واتساب' }),
        { 
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    console.log("WhatsApp API connection successful")
    return new Response(
      JSON.stringify({ success: true, message: 'تم الاتصال بنجاح' }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'حدث خطأ أثناء اختبار الاتصال' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})
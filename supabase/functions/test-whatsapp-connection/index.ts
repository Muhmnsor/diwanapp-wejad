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
      api_key: body.api_key ? "***" : undefined
    })

    const { business_phone, api_key } = body

    // Validate required fields
    const missingFields = []
    if (!business_phone) missingFields.push('business_phone')
    if (!api_key) missingFields.push('api_key')

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

    // Test connection to Interakt API
    console.log("Testing Interakt API connection")
    const response = await fetch('https://api.interakt.ai/v1/public/track/users/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "phoneNumber": business_phone,
        "countryCode": "+966",
        "traits": {
          "name": "Test Connection"
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Interakt API error:', error)
      return new Response(
        JSON.stringify({ error: 'فشل الاتصال بواجهة برمجة تطبيقات Interakt' }),
        { 
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    console.log("Interakt API connection successful")
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
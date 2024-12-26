import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

console.log("Send WhatsApp Test Message function started")

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

    // Send test message using Interakt API
    console.log("Sending test message via Interakt API")
    const response = await fetch('https://api.interakt.ai/v1/public/message/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "countryCode": "+966",
        "phoneNumber": business_phone,
        "type": "text",
        "message": {
          "content": "رسالة تجريبية من نظام إدارة الفعاليات 👋"
        }
      })
    })

    const responseText = await response.text()
    console.log('Interakt API response:', responseText)

    if (!response.ok) {
      console.error('Interakt API error:', responseText)
      return new Response(
        JSON.stringify({ 
          error: 'فشل إرسال الرسالة التجريبية',
          details: responseText 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    console.log("Test message sent successfully")
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إرسال الرسالة التجريبية بنجاح',
        response: responseText 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'حدث خطأ أثناء إرسال الرسالة التجريبية',
        details: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})
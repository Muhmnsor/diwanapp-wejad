import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

console.log("Test WhatsApp Connection function started")

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { business_phone, api_key, account_id, whatsapp_number_id } = await req.json()

    // Validate required fields
    if (!business_phone || !api_key || !account_id || !whatsapp_number_id) {
      return new Response(
        JSON.stringify({ error: 'جميع الحقول مطلوبة' }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Test connection to WhatsApp API
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

    // Connection successful
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
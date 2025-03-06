
import { corsHeaders } from '../_shared/cors.ts'

interface WhatsAppSettings {
  business_phone: string;
  api_key: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const settings = await req.json() as WhatsAppSettings

    // Validate required fields
    if (!settings.business_phone) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'رقم الواتساب مطلوب'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    if (!settings.api_key) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'مفتاح API مطلوب'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log('Sending test WhatsApp message to phone:', settings.business_phone.substring(0, 4) + '****')

    // Format the phone number if necessary
    let phoneNumber = settings.business_phone
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '+966' + phoneNumber.substring(1)
      } else if (!phoneNumber.startsWith('966')) {
        phoneNumber = '+966' + phoneNumber
      } else {
        phoneNumber = '+' + phoneNumber
      }
    }

    // Create a test message
    const testMessage = 'هذه رسالة اختبار من نظام إدارة الفعاليات. إذا تلقيت هذه الرسالة، فهذا يعني أن إعدادات WhatsApp تعمل بشكل صحيح.'

    // Get the WhatsApp Business Account ID
    const accountResponse = await fetch('https://graph.facebook.com/v17.0/me/phone_numbers', {
      headers: {
        'Authorization': `Bearer ${settings.api_key}`
      }
    })

    if (!accountResponse.ok) {
      const errorData = await accountResponse.json()
      console.error('Error fetching phone numbers:', errorData)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'فشل في الحصول على رقم الواتساب: ' + (errorData.error?.message || 'خطأ في API'),
          details: errorData
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Still return 200 but with success: false
        }
      )
    }

    const phoneData = await accountResponse.json()
    const wabaPhoneId = phoneData.data?.[0]?.id

    if (!wabaPhoneId) {
      console.error('No WhatsApp phone ID found in response:', phoneData)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'لم يتم العثور على رقم الواتساب في الحساب'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Send the test message
    const messageResponse = await fetch(`https://graph.facebook.com/v17.0/${wabaPhoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: testMessage }
      })
    })

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json()
      console.error('Error sending test message:', errorData)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'فشل في إرسال رسالة الاختبار: ' + (errorData.error?.message || 'خطأ في إرسال الرسالة'),
          details: errorData
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    const messageData = await messageResponse.json()
    console.log('Test message sent successfully:', messageData)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم إرسال رسالة الاختبار بنجاح',
        data: {
          messageId: messageData.messages?.[0]?.id
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error sending test message:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

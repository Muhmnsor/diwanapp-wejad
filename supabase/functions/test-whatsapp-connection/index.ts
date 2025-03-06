
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

    console.log('Testing WhatsApp connection for phone number:', settings.business_phone.substring(0, 4) + '****')

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
    
    // We'll use the Meta Graph API to check the account status
    // First we need to find the WhatsApp Business Account ID
    const accountResponse = await fetch('https://graph.facebook.com/v17.0/me/accounts', {
      headers: {
        'Authorization': `Bearer ${settings.api_key}`
      }
    })

    if (!accountResponse.ok) {
      const errorData = await accountResponse.json()
      console.error('Error fetching account:', errorData)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'فشل الاتصال بواتساب: ' + (errorData.error?.message || 'API key غير صالح'),
          details: errorData
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Still return 200 to client but with success: false
        }
      )
    }

    const accountData = await accountResponse.json()
    console.log('Account data fetched successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم الاتصال بنجاح',
        data: {
          account: accountData.data?.[0]?.name || 'حساب واتساب'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error testing WhatsApp connection:', error)
    
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

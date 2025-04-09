import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get API key from environment
  const WHATSAPP_API_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN');
  const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return new Response(
      JSON.stringify({ error: 'WhatsApp API configuration missing' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { to, templateName, parameters } = await req.json();
    
    // Validate phone number format (should start with country code like 966)
    if (!to || typeof to !== 'string' || to.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Format the phone number - make sure it starts with country code without +
    let formattedNumber = to;
    if (to.startsWith('+')) {
      formattedNumber = to.substring(1);
    } else if (to.startsWith('0')) {
      // Assuming Saudi Arabia - replace leading 0 with country code 966
      formattedNumber = '966' + to.substring(1);
    }
    
    // Prepare the WhatsApp API request
    const url = `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    // Format message components for template
    const components = [];
    if (parameters) {
      const paramComponents = [];
      Object.keys(parameters).forEach(key => {
        if (key.startsWith('message')) {
          paramComponents.push({
            type: "text",
            text: parameters[key]
          });
        }
      });
      
      if (paramComponents.length > 0) {
        components.push({
          type: "body",
          parameters: paramComponents
        });
      }
    }
    
    // Build the request payload
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedNumber,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: "ar"
        },
        components: components.length > 0 ? components : undefined
      }
    };
    
    console.log("Sending WhatsApp message:", JSON.stringify(payload));
    
    // Make the API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("WhatsApp API error:", data);
      return new Response(
        JSON.stringify({ error: 'WhatsApp API error', details: data }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})


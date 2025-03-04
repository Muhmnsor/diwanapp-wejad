
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // تسجيل الطلب الوارد
  console.log('Received request:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  })

  // التعامل مع طلبات CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // التحقق من طريقة الطلب
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`)
    }

    // إنشاء عميل Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // تحليل بيانات الطلب
    let requestData;
    try {
      requestData = await req.json()
      console.log('Request data:', requestData)
    } catch (error) {
      console.error('Error parsing request body:', error)
      throw new Error('Invalid request body')
    }

    const { operation, userId, newPassword, newRole } = requestData
    console.log('Managing user:', { operation, userId })

    if (operation === 'get_users') {
      const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers()
      
      if (usersError) {
        console.error('Error fetching users:', usersError)
        throw usersError
      }

      return new Response(
        JSON.stringify({ users }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (operation === 'update_password' && userId && newPassword) {
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      )

      if (updateError) {
        console.error('Error updating password:', updateError)
        throw updateError
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (operation === 'update_role' && userId && newRole) {
      // الحصول على معرف الدور الجديد
      const { data: roles, error: rolesError } = await supabaseClient
        .from('roles')
        .select('id')
        .eq('name', newRole)
        .single()

      if (rolesError) {
        console.error('Error fetching role:', rolesError)
        throw rolesError
      }

      // تحديث دور المستخدم
      const { error: updateError } = await supabaseClient
        .from('user_roles')
        .upsert({
          user_id: userId,
          role_id: roles.id
        })

      if (updateError) {
        console.error('Error updating role:', updateError)
        throw updateError
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (operation === 'delete_user' && userId) {
      // استخدام وظيفة الحذف المنطقي بدلاً من الحذف الفعلي
      const { data, error } = await supabaseClient.rpc('soft_delete_user', {
        user_id: userId
      })

      if (error) {
        console.error('Error soft deleting user:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid operation')

  } catch (error) {
    console.error('Error in manage-users function:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.details || error.toString()
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})


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

    const { operation, userId, newPassword, roleId } = requestData
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
      console.log('Updating password for user:', userId)
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

    if (operation === 'update_role' && userId && roleId) {
      console.log('Updating role for user:', userId, 'to role ID:', roleId)
      
      // تعيين دور للمستخدم باستخدام وظيفة قاعدة البيانات
      const { data, error: updateError } = await supabaseClient.rpc('assign_user_role', {
        p_user_id: userId,
        p_role_id: roleId
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

    if (operation === 'create_user' && requestData.username && requestData.password && requestData.roleId) {
      console.log('Creating new user with username:', requestData.username);
      
      try {
        // 1. إنشاء المستخدم في نظام المصادقة
        const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
          email: requestData.username,
          password: requestData.password,
          email_confirm: true,
          user_metadata: {
            display_name: requestData.displayName || null
          }
        });
        
        if (authError) {
          console.error("خطأ في إنشاء المستخدم:", authError);
          throw authError;
        }
        
        console.log("تم إنشاء المستخدم بنجاح:", authData.user.id);
        const userId = authData.user.id;
        
        // 2. تحديث الاسم الشخصي إذا تم إدخاله
        if (requestData.displayName) {
          console.log("تحديث الاسم الشخصي...");
          const { error: displayNameError } = await supabaseClient
            .from('profiles')
            .update({ display_name: requestData.displayName })
            .eq('id', userId);
            
          if (displayNameError) {
            console.error("خطأ في تحديث الاسم الشخصي:", displayNameError);
            console.warn("تم تجاوز خطأ تحديث الاسم الشخصي واستكمال العملية");
          } else {
            console.log("تم تحديث الاسم الشخصي بنجاح");
          }
        }
        
        // 3. تعيين دور للمستخدم
        console.log("تعيين دور للمستخدم...");
        const { error: roleError } = await supabaseClient.rpc('assign_user_role', {
          p_user_id: userId,
          p_role_id: requestData.roleId,
        });
        
        if (roleError) {
          console.error("خطأ في تعيين الدور:", roleError);
          throw roleError;
        }
        
        // 4. تسجيل نشاط إنشاء المستخدم
        await supabaseClient.rpc('log_user_activity', {
          user_id: userId,
          activity_type: 'user_created',
          details: `تم إنشاء المستخدم (البريد: ${requestData.username}, الدور: ${requestData.roleId}, الاسم الشخصي: ${requestData.displayName || 'غير محدد'})`
        });
        
        return new Response(
          JSON.stringify({ success: true, userId: userId }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error("خطأ في إنشاء المستخدم:", error);
        throw error;
      }
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

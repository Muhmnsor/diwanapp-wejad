
import { createClient } from '@supabase/supabase-js'
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

// تكوين CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// إنشاء عميل Supabase مع دور الخدمة للسماح بالوصول الكامل
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

serve(async (req) => {
  // معالجة طلبات CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    // التحقق من المصادقة
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'لم يتم توفير رمز المصادقة' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // استخراج البيانات المرسلة
    const { operation, userId, newPassword, email, password, roleId } = await req.json()
    console.log(`تنفيذ العملية: ${operation}`)

    // إدارة المستخدمين عبر واجهة برمجة التطبيقات الإدارية
    switch (operation) {
      case 'create_user_with_role':
        return await createUserWithRole(email, password, roleId)
      
      case 'update_role':
        return await updateUserRole(userId, roleId)
      
      case 'update_password':
        return await updateUserPassword(userId, newPassword)
      
      case 'delete_user':
        return await deleteUser(userId)
      
      default:
        return new Response(
          JSON.stringify({ error: 'عملية غير صالحة' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('خطأ في معالجة الطلب:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// إنشاء مستخدم جديد مع تعيين دور
async function createUserWithRole(email, password, roleId) {
  console.log('إنشاء مستخدم جديد:', email)
  
  // 1. إنشاء المستخدم في نظام المصادقة
  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (createError) {
    console.error('خطأ في إنشاء المستخدم:', createError)
    return new Response(
      JSON.stringify({ error: createError.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  const userId = userData.user.id
  console.log('تم إنشاء المستخدم بنجاح، المعرف:', userId)
  
  // 2. تعيين دور للمستخدم الجديد
  if (roleId) {
    console.log('تعيين الدور للمستخدم:', roleId)
    
    // التحقق من وجود الدور المحدد
    const { data: roleExists, error: roleCheckError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('id', roleId)
      .single()
    
    if (roleCheckError || !roleExists) {
      console.error('الدور المحدد غير موجود:', roleCheckError || 'الدور غير موجود')
      return new Response(
        JSON.stringify({ error: 'الدور المحدد غير موجود', user: userData.user }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // إدراج الدور في جدول user_roles
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId })

    if (roleError) {
      console.error('خطأ في تعيين الدور للمستخدم:', roleError)
      return new Response(
        JSON.stringify({ error: roleError.message, user: userData.user }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    console.log('تم تعيين الدور بنجاح')
  }

  return new Response(
    JSON.stringify({ success: true, user: userData.user }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

// تحديث دور المستخدم
async function updateUserRole(userId, roleId) {
  console.log('تحديث دور المستخدم:', userId, 'إلى الدور:', roleId)
  
  // التحقق من وجود المستخدم
  const { data: userExists, error: userCheckError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()
  
  if (userCheckError || !userExists) {
    console.error('المستخدم غير موجود:', userCheckError || 'المستخدم غير موجود')
    return new Response(
      JSON.stringify({ error: 'المستخدم غير موجود' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  }
  
  // التحقق من وجود الدور
  const { data: roleExists, error: roleCheckError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('id', roleId)
    .single()
  
  if (roleCheckError || !roleExists) {
    console.error('الدور المحدد غير موجود:', roleCheckError || 'الدور غير موجود')
    return new Response(
      JSON.stringify({ error: 'الدور المحدد غير موجود' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
  
  // أولاً، التحقق مما إذا كان المستخدم لديه دور بالفعل
  const { data: existingRole, error: checkError } = await supabaseAdmin
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  
  console.log('التحقق من الدور الحالي:', existingRole)
  
  let result;
  
  if (existingRole) {
    // إذا كان هناك دور موجود، قم بتحديثه
    console.log('تحديث الدور الموجود')
    result = await supabaseAdmin
      .from('user_roles')
      .update({ role_id: roleId })
      .eq('user_id', userId)
  } else {
    // إذا لم يكن هناك دور، قم بإنشاء واحد جديد
    console.log('إنشاء سجل دور جديد')
    result = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId })
  }
  
  // التحقق من النتيجة
  if (result.error) {
    console.error('خطأ في تحديث الدور:', result.error)
    return new Response(
      JSON.stringify({ error: result.error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
  
  console.log('تم تحديث الدور بنجاح')
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

// تحديث كلمة مرور المستخدم
async function updateUserPassword(userId, newPassword) {
  console.log('تحديث كلمة مرور المستخدم:', userId)
  
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  )
  
  if (error) {
    console.error('خطأ في تحديث كلمة المرور:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
  
  console.log('تم تحديث كلمة المرور بنجاح')
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

// حذف مستخدم
async function deleteUser(userId) {
  console.log('حذف المستخدم:', userId)
  
  // 1. حذف دور المستخدم أولاً
  const { error: roleDeleteError } = await supabaseAdmin
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
  
  if (roleDeleteError) {
    console.error('خطأ في حذف دور المستخدم:', roleDeleteError)
    // نستمر بالحذف حتى لو فشل حذف الدور
  }
  
  // 2. حذف المستخدم
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  
  if (error) {
    console.error('خطأ في حذف المستخدم:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
  
  console.log('تم حذف المستخدم بنجاح')
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

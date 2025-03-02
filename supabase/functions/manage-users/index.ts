
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // مع CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // إنشاء عميل Supabase بصلاحيات الخدمة
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });

    const { operation, userId, newPassword, roleId } = await req.json();
    console.log(`تنفيذ العملية: ${operation} للمستخدم: ${userId}`);

    let result = {};
    
    if (operation === "update_password") {
      console.log("تحديث كلمة المرور للمستخدم:", userId);
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });
      
      if (error) throw error;
      result = { success: true, message: "تم تحديث كلمة المرور بنجاح" };
    } 
    else if (operation === "update_role") {
      console.log("تحديث دور المستخدم:", userId, "إلى الدور:", roleId);
      
      // حذف الأدوار الحالية أولاً
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      
      if (deleteError) {
        console.error("خطأ في حذف الأدوار السابقة:", deleteError);
        throw deleteError;
      }
      
      console.log("تم حذف الأدوار السابقة بنجاح");
      
      // إضافة الدور الجديد
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role_id: roleId,
        });
      
      if (insertError) {
        console.error("خطأ في إضافة الدور الجديد:", insertError);
        throw insertError;
      }
      
      console.log("تم إضافة الدور الجديد بنجاح");
      result = { success: true, message: "تم تحديث دور المستخدم بنجاح" };
    }
    else if (operation === "delete_user") {
      console.log("حذف المستخدم:", userId);
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      result = { success: true, message: "تم حذف المستخدم بنجاح" };
    }
    else if (operation === "create_user_with_role") {
      const { email, password, roleId } = await req.json();
      console.log("إنشاء مستخدم جديد:", email, "مع الدور:", roleId);
      
      // إنشاء مستخدم جديد
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      
      if (error) throw error;
      
      // إضافة دور للمستخدم الجديد
      if (roleId) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: data.user.id,
            role_id: roleId,
          });
        
        if (roleError) {
          console.error("خطأ في تعيين الدور:", roleError);
          throw roleError;
        }
      }
      
      result = { 
        success: true, 
        message: "تم إنشاء المستخدم بنجاح", 
        user: data.user 
      };
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("خطأ:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

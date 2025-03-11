
import { supabase } from "@/integrations/supabase/client";
import { assignDeveloperRole } from "./roleManagement";

/**
 * دالة للتحقق من وجود دور المطور وإنشائه إذا لم يكن موجوداً
 */
export const initializeDeveloperRole = async (): Promise<string | null> => {
  try {
    // التحقق من وجود دور المطور
    const { data: existingRole, error: fetchError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'developer')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error checking developer role:', fetchError);
      return null;
    }

    // إذا كان الدور موجوداً، نعيد معرّفه
    if (existingRole?.id) {
      console.log('Developer role already exists:', existingRole.id);
      return existingRole.id;
    }

    // إنشاء دور المطور إذا لم يكن موجوداً
    const { data: newRole, error: insertError } = await supabase
      .from('roles')
      .insert({
        name: 'developer',
        description: 'Developer role with access to development tools and settings'
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating developer role:', insertError);
      return null;
    }

    console.log('Created new developer role:', newRole?.id);
    return newRole?.id || null;
  } catch (error) {
    console.error('Unexpected error in initializeDeveloperRole:', error);
    return null;
  }
};

/**
 * التعيين التلقائي لدور المطور للمستخدمين الإداريين
 */
export const autoAssignDeveloperRole = async (): Promise<void> => {
  try {
    // الحصول على معرّف دور المطور أو إنشائه
    const developerRoleId = await initializeDeveloperRole();
    
    if (!developerRoleId) {
      console.error('Failed to initialize developer role');
      return;
    }
    
    // العثور على المستخدمين الإداريين من خلال user_roles
    const { data: adminUsers, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id, roles:role_id(name)')
      .eq('roles.name', 'admin');
      
    if (adminError) {
      console.error('Error fetching admin users:', adminError);
      return;
    }
    
    if (!adminUsers || adminUsers.length === 0) {
      console.log('No admin users found for developer role assignment');
      return;
    }
    
    const adminUserIds = adminUsers.map(user => user.user_id);
    console.log(`Found ${adminUserIds.length} admin users to assign developer role`);
    
    // تعيين دور المطور لكل مستخدم إداري
    for (const userId of adminUserIds) {
      await assignDeveloperRole(userId);
    }
    
    console.log('Completed auto-assignment of developer roles to admin users');
  } catch (error) {
    console.error('Error in autoAssignDeveloperRole:', error);
  }
};

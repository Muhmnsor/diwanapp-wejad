
import { supabase } from "@/integrations/supabase/client";
import { Permission } from "../types";
import { Role } from "../../types";
import { ideasPermissions } from "../data/ideasPermissionsData";

// بيانات تجريبية للصلاحيات
const demoPermissions: Permission[] = [
  // صلاحيات المستخدمين
  {
    id: "users-view",
    name: "عرض المستخدمين",
    description: "عرض قائمة المستخدمين",
    module: "إدارة المستخدمين"
  },
  {
    id: "users-create",
    name: "إضافة مستخدم",
    description: "إضافة مستخدمين جدد",
    module: "إدارة المستخدمين"
  },
  {
    id: "users-edit",
    name: "تعديل المستخدمين",
    description: "تعديل بيانات المستخدمين",
    module: "إدارة المستخدمين"
  },
  {
    id: "users-delete",
    name: "حذف المستخدمين",
    description: "حذف المستخدمين من النظام",
    module: "إدارة المستخدمين"
  },
  
  // صلاحيات الفعاليات
  {
    id: "events-view",
    name: "عرض الفعاليات",
    description: "عرض جميع الفعاليات",
    module: "إدارة الفعاليات"
  },
  {
    id: "events-create",
    name: "إنشاء فعالية",
    description: "إنشاء فعاليات جديدة",
    module: "إدارة الفعاليات"
  },
  {
    id: "events-edit",
    name: "تعديل الفعاليات",
    description: "تعديل الفعاليات الموجودة",
    module: "إدارة الفعاليات"
  },
  {
    id: "events-delete",
    name: "حذف الفعاليات",
    description: "حذف الفعاليات من النظام",
    module: "إدارة الفعاليات"
  },
  
  // صلاحيات المشاريع
  {
    id: "projects-view",
    name: "عرض المشاريع",
    description: "عرض جميع المشاريع",
    module: "إدارة المشاريع"
  },
  {
    id: "projects-create",
    name: "إنشاء مشروع",
    description: "إنشاء مشاريع جديدة",
    module: "إدارة المشاريع"
  },
  {
    id: "projects-edit",
    name: "تعديل المشاريع",
    description: "تعديل المشاريع الموجودة",
    module: "إدارة المشاريع"
  },
  {
    id: "projects-delete",
    name: "حذف المشاريع",
    description: "حذف المشاريع من النظام",
    module: "إدارة المشاريع"
  },
  
  // صلاحيات التقارير
  {
    id: "reports-view",
    name: "عرض التقارير",
    description: "عرض جميع التقارير",
    module: "إدارة التقارير"
  },
  {
    id: "reports-create",
    name: "إنشاء تقرير",
    description: "إنشاء تقارير جديدة",
    module: "إدارة التقارير"
  },
  {
    id: "reports-export",
    name: "تصدير التقارير",
    description: "تصدير التقارير بتنسيقات مختلفة",
    module: "إدارة التقارير"
  }
];

// اضافة صلاحيات الأفكار إلى الصلاحيات التجريبية
const allPermissions = [...demoPermissions, ...ideasPermissions];

// Fetch all permissions
export const fetchPermissions = async (): Promise<Permission[]> => {
  try {
    // نحاول جلب الصلاحيات من قاعدة البيانات
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('module', { ascending: true });

    if (error) {
      console.error('Error fetching permissions:', error);
      // في حالة الخطأ نعرض البيانات التجريبية
      return allPermissions;
    }

    // إذا كانت البيانات فارغة نعرض البيانات التجريبية
    if (!data || data.length === 0) {
      console.log('No permissions found, using demo data');
      return allPermissions;
    }

    return data as Permission[];
  } catch (error) {
    console.error('Error in permissions query:', error);
    // في حالة الخطأ نعرض البيانات التجريبية
    return allPermissions;
  }
};

// Fetch role permissions
export const fetchRolePermissions = async (roleId: string): Promise<string[]> => {
  try {
    if (!roleId) return [];
    
    const { data, error } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', roleId);

    if (error) {
      console.error('Error fetching role permissions:', error);
      throw error;
    }

    return data.map(rp => rp.permission_id);
  } catch (error) {
    console.error('Error in role permissions query:', error);
    return [];
  }
};

// Save role permissions
export const saveRolePermissions = async (
  roleId: string, 
  selectedPermissions: string[]
): Promise<void> => {
  if (!roleId) {
    throw new Error("Role ID is required");
  }

  console.log("Saving permissions for role:", roleId);
  console.log("Selected permissions:", selectedPermissions);
  
  // Delete existing permissions
  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId);
  
  if (deleteError) {
    console.error("Error deleting existing permissions:", deleteError);
    throw deleteError;
  }
  
  // Insert new permissions if there are any
  if (selectedPermissions.length > 0) {
    const rolePermissions = selectedPermissions.map(permissionId => ({
      role_id: roleId,
      permission_id: permissionId
    }));
    
    console.log("Inserting role permissions:", rolePermissions);
    
    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(rolePermissions);
    
    if (insertError) {
      console.error("Error inserting permissions:", insertError);
      throw insertError;
    }
  }
};

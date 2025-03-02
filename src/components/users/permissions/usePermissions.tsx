
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Module, Permission } from "./types";
import { Role } from "../types";
import { toast } from "sonner";

export const usePermissions = (role: Role) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // استعلام للحصول على جميع الصلاحيات
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('permissions')
          .select('*')
          .order('module', { ascending: true });

        if (error) {
          console.error('Error fetching permissions:', error);
          throw error;
        }

        return data as Permission[];
      } catch (error) {
        console.error('Error in permissions query:', error);
        throw error;
      }
    }
  });

  // استعلام للحصول على صلاحيات الدور
  const { data: rolePermissions = [], refetch: refetchRolePermissions } = useQuery({
    queryKey: ['role-permissions', role?.id],
    queryFn: async () => {
      try {
        if (!role?.id) return [];
        
        const { data, error } = await supabase
          .from('role_permissions')
          .select('permission_id')
          .eq('role_id', role.id);

        if (error) {
          console.error('Error fetching role permissions:', error);
          throw error;
        }

        return data.map(rp => rp.permission_id);
      } catch (error) {
        console.error('Error in role permissions query:', error);
        return [];
      }
    },
    enabled: !!role?.id
  });

  // تحديث حالة الصلاحيات المحددة عند تغير بيانات صلاحيات الدور
  useEffect(() => {
    if (rolePermissions.length > 0) {
      setSelectedPermissions(rolePermissions);
    } else {
      setSelectedPermissions([]);
    }
  }, [rolePermissions]);

  // تنظيم الصلاحيات حسب الوحدات
  useEffect(() => {
    if (permissions.length > 0) {
      const moduleMap: { [key: string]: Permission[] } = {};
      
      // تجميع الصلاحيات حسب الوحدة
      permissions.forEach(permission => {
        if (!moduleMap[permission.module]) {
          moduleMap[permission.module] = [];
        }
        moduleMap[permission.module].push(permission);
      });
      
      // تحويل الخريطة إلى مصفوفة من الوحدات
      const moduleArray: Module[] = Object.keys(moduleMap).map(moduleName => ({
        name: moduleName,
        permissions: moduleMap[moduleName],
        isOpen: true // مفتوح افتراضيًا
      }));
      
      setModules(moduleArray);
    }
  }, [permissions]);

  // تبديل حالة صلاحية واحدة
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // تبديل حالة جميع صلاحيات الوحدة
  const handleModuleToggle = (module: Module) => {
    const modulePermissionIds = module.permissions.map(p => p.id);
    const areAllSelected = module.permissions.every(permission => 
      selectedPermissions.includes(permission.id)
    );
    
    if (areAllSelected) {
      // إلغاء تحديد جميع صلاحيات الوحدة
      setSelectedPermissions(prev => prev.filter(id => !modulePermissionIds.includes(id)));
    } else {
      // تحديد جميع صلاحيات الوحدة
      setSelectedPermissions(prev => {
        const newSelected = [...prev];
        modulePermissionIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    }
  };

  // تبديل حالة فتح/إغلاق الوحدة
  const toggleModuleOpen = (moduleName: string) => {
    setModules(prev => prev.map(m => 
      m.name === moduleName ? { ...m, isOpen: !m.isOpen } : m
    ));
  };

  // حفظ التغييرات
  const handleSave = async () => {
    if (!role?.id) {
      toast.error("لم يتم تحديد دور");
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Saving permissions for role:", role.id);
      console.log("Selected permissions:", selectedPermissions);
      
      // حذف الصلاحيات الحالية للدور
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', role.id);
      
      if (deleteError) {
        console.error("Error deleting existing permissions:", deleteError);
        throw deleteError;
      }
      
      // إذا كانت هناك صلاحيات محددة، أضفها
      if (selectedPermissions.length > 0) {
        const rolePermissions = selectedPermissions.map(permissionId => ({
          role_id: role.id,
          permission_id: permissionId
        }));
        
        console.log("Inserting role permissions:", rolePermissions);
        
        const { error: insertError, data: insertResult } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);
        
        console.log("Insert result:", insertResult);
        
        if (insertError) {
          console.error("Error inserting permissions:", insertError);
          throw insertError;
        }
      }
      
      toast.success("تم حفظ صلاحيات الدور بنجاح");
      await refetchRolePermissions();
    } catch (error) {
      console.error('Error saving role permissions:', error);
      toast.error("حدث خطأ أثناء حفظ الصلاحيات");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    modules,
    selectedPermissions,
    isLoading,
    permissions,
    isSubmitting,
    handlePermissionToggle,
    handleModuleToggle,
    toggleModuleOpen,
    handleSave
  };
};

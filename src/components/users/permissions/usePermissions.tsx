
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Role } from "../types";
import { Module, PermissionData } from "./types";
import { fetchPermissions, fetchRolePermissions, saveRolePermissions } from "./api/permissionsApi";

export const usePermissions = (role: Role) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch permissions and role permissions
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch all permissions
        const permissions = await fetchPermissions();
        
        // Group permissions by module
        const moduleMap = new Map<string, PermissionData[]>();
        
        permissions.forEach(permission => {
          if (!moduleMap.has(permission.module)) {
            moduleMap.set(permission.module, []);
          }
          moduleMap.get(permission.module)?.push(permission);
        });
        
        // Convert map to array of modules
        const modulesArray: Module[] = [];
        
        moduleMap.forEach((permissions, name) => {
          modulesArray.push({
            name,
            permissions,
            isOpen: false
          });
        });
        
        setModules(modulesArray);
        
        // If role is available, fetch its permissions
        if (role?.id) {
          const rolePermissions = await fetchRolePermissions(role.id);
          setSelectedPermissions(rolePermissions);
        }
      } catch (error) {
        console.error('Error loading permissions data:', error);
        toast.error('حدث خطأ أثناء تحميل بيانات الصلاحيات');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [role]);

  // Handle permission toggle
  const handlePermissionToggle = useCallback((permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  }, []);

  // Handle module toggle (select/deselect all permissions in a module)
  const handleModuleToggle = useCallback((module: Module) => {
    const modulePermissionIds = module.permissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Deselect all permissions in this module
      setSelectedPermissions(prev => 
        prev.filter(id => !modulePermissionIds.includes(id))
      );
    } else {
      // Select all permissions in this module
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
  }, [selectedPermissions]);

  // Toggle module open/closed state
  const toggleModuleOpen = useCallback((moduleName: string) => {
    setModules(prev => 
      prev.map(module => 
        module.name === moduleName 
          ? { ...module, isOpen: !module.isOpen } 
          : module
      )
    );
  }, []);

  // Save permissions
  const handleSave = useCallback(async () => {
    if (!role?.id) {
      toast.error('لم يتم تحديد الدور');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await saveRolePermissions(role.id, selectedPermissions);
      toast.success('تم حفظ الصلاحيات بنجاح');
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('حدث خطأ أثناء حفظ الصلاحيات');
    } finally {
      setIsSubmitting(false);
    }
  }, [role, selectedPermissions]);

  return {
    modules,
    selectedPermissions,
    isLoading,
    isSubmitting,
    handlePermissionToggle,
    handleModuleToggle,
    toggleModuleOpen,
    handleSave
  };
};

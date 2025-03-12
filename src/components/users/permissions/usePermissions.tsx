
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Role } from "../types";
import { toast } from "sonner";

// Types for permissions system
interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface Module {
  name: string;
  description: string;
  permissions: Permission[];
  isOpen?: boolean;
  isAllSelected?: boolean;
}

export const usePermissions = (role: Role) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      setIsLoading(true);
      try {
        // Fetch all permissions
        const { data: allPermissions, error: permissionsError } = await supabase
          .from('permissions')
          .select('*')
          .order('module');

        if (permissionsError) throw permissionsError;

        // Fetch role permissions
        const { data: rolePermissions, error: rolePermissionsError } = await supabase
          .from('role_permissions')
          .select('permission_id')
          .eq('role_id', role.id);

        if (rolePermissionsError) throw rolePermissionsError;

        // Create map of selected permissions
        const selectedMap: Record<string, boolean> = {};
        rolePermissions.forEach((rp) => {
          selectedMap[rp.permission_id] = true;
        });
        setSelectedPermissions(selectedMap);

        // Group permissions by module
        const modulesMap: Record<string, Module> = {};
        allPermissions.forEach((permission) => {
          if (!modulesMap[permission.module]) {
            modulesMap[permission.module] = {
              name: permission.module,
              description: `${permission.module} Module`,
              permissions: [],
              isOpen: false,
            };
          }
          modulesMap[permission.module].permissions.push(permission);
        });

        // Convert map to array
        const modulesArray = Object.values(modulesMap);

        // Calculate isAllSelected for each module
        modulesArray.forEach((module) => {
          module.isAllSelected = module.permissions.every(
            (permission) => selectedMap[permission.id]
          );
        });

        setModules(modulesArray);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast.error("حدث خطأ أثناء تحميل الصلاحيات");
      } finally {
        setIsLoading(false);
      }
    };

    if (role?.id) {
      fetchPermissions();
    }
  }, [role]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [permissionId]: !prev[permissionId],
    }));

    // Update module isAllSelected state
    setModules((prevModules) =>
      prevModules.map((module) => {
        const updatedModule = { ...module };
        updatedModule.isAllSelected = module.permissions.every(
          (permission) =>
            permission.id === permissionId
              ? !selectedPermissions[permissionId]
              : selectedPermissions[permission.id]
        );
        return updatedModule;
      })
    );
  };

  const handleModuleToggle = (moduleName: string) => {
    const module = modules.find((m) => m.name === moduleName);
    if (!module) return;

    const isCurrentlyAllSelected = module.isAllSelected;
    const updatedSelectedPermissions = { ...selectedPermissions };

    // Toggle all permissions in the module
    module.permissions.forEach((permission) => {
      updatedSelectedPermissions[permission.id] = !isCurrentlyAllSelected;
    });

    setSelectedPermissions(updatedSelectedPermissions);

    // Update module state
    setModules((prevModules) =>
      prevModules.map((mod) =>
        mod.name === moduleName
          ? { ...mod, isAllSelected: !isCurrentlyAllSelected }
          : mod
      )
    );
  };

  const toggleModuleOpen = (moduleName: string) => {
    setModules((prevModules) =>
      prevModules.map((module) =>
        module.name === moduleName
          ? { ...module, isOpen: !module.isOpen }
          : module
      )
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Get the current role permissions
      const { data: currentPermissions, error: fetchError } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', role.id);

      if (fetchError) throw fetchError;

      // Create sets for easier comparison
      const currentPermissionIds = new Set(currentPermissions.map(p => p.permission_id));
      const selectedPermissionIds = new Set(
        Object.entries(selectedPermissions)
          .filter(([_, isSelected]) => isSelected)
          .map(([id]) => id)
      );

      // Permissions to add
      const permissionsToAdd = [...selectedPermissionIds].filter(id => !currentPermissionIds.has(id));
      
      // Permissions to remove
      const permissionsToRemove = [...currentPermissionIds].filter(id => !selectedPermissionIds.has(id));

      // Add new permissions
      if (permissionsToAdd.length > 0) {
        const { error: addError } = await supabase
          .from('role_permissions')
          .insert(
            permissionsToAdd.map(permissionId => ({
              role_id: role.id,
              permission_id: permissionId
            }))
          );

        if (addError) throw addError;
      }

      // Remove permissions
      for (const permissionId of permissionsToRemove) {
        const { error: removeError } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', role.id)
          .eq('permission_id', permissionId);

        if (removeError) throw removeError;
      }

      toast.success("تم حفظ الصلاحيات بنجاح");
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("حدث خطأ أثناء حفظ الصلاحيات");
    } finally {
      setIsSubmitting(false);
    }
  };

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

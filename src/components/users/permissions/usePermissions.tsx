
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

// Map modules to their corresponding app permissions
const MODULE_TO_APP_MAP: Record<string, string[]> = {
  "events": ["events"],
  "documents": ["documents"],
  "tasks": ["tasks"],
  "ideas": ["ideas"],
  "finance": ["finance"],
  "users": ["users"],
  "website": ["website"],
  "store": ["store"],
  "notifications": ["notifications"],
  "requests": ["requests"],
  "developer": ["developer"]
};

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

  // Function to sync detailed permissions with app permissions
  const syncAppPermissions = async (roleId: string, modulePermissions: Module[]) => {
    try {
      // First, get current app permissions
      const { data: currentAppPerms, error: fetchError } = await supabase
        .from('app_permissions')
        .select('app_name')
        .eq('role_id', roleId);

      if (fetchError) throw fetchError;

      const currentAppNames = new Set(currentAppPerms?.map(p => p.app_name) || []);
      const appPermissionsToSet = new Set<string>();
      
      // For each module with at least one permission selected, add the corresponding app
      modulePermissions.forEach(module => {
        // Check if any permission is selected in this module
        const hasSelectedPermissions = module.permissions.some(
          permission => selectedPermissions[permission.id]
        );
        
        if (hasSelectedPermissions) {
          // Get corresponding app names for this module
          const appNames = MODULE_TO_APP_MAP[module.name] || [];
          appNames.forEach(appName => appPermissionsToSet.add(appName));
        }
      });

      // Permissions to add
      const appsToAdd = [...appPermissionsToSet].filter(app => !currentAppNames.has(app));
      
      // Add missing app permissions
      if (appsToAdd.length > 0) {
        const { error: addError } = await supabase
          .from('app_permissions')
          .insert(
            appsToAdd.map(appName => ({
              role_id: roleId,
              app_name: appName
            }))
          );

        if (addError) {
          console.error("Error adding app permissions:", addError);
          // Continue with other operations even if this fails
        } else {
          console.log(`Added app permissions: ${appsToAdd.join(', ')}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error syncing app permissions:", error);
      return false;
    }
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

      // Sync app permissions based on the selected detailed permissions
      await syncAppPermissions(role.id, modules);

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

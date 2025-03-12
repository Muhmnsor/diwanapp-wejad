import { useState, useCallback } from "react";

export const usePermissionOperations = () => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handlePermissionToggle = useCallback((permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  }, []);

  const handleModuleToggle = useCallback((module: any) => {
    const modulePermissionIds = module.permissions.map((p: any) => p.id);
    
    setSelectedPermissions(prev => {
      // Check if all permissions in this module are already selected
      const allSelected = modulePermissionIds.every(id => prev.includes(id));
      
      if (allSelected) {
        // If all are selected, remove them all
        return prev.filter(id => !modulePermissionIds.includes(id));
      } else {
        // Otherwise, add all missing permissions
        const newSelectedPermissions = [...prev];
        
        modulePermissionIds.forEach(id => {
          if (!newSelectedPermissions.includes(id)) {
            newSelectedPermissions.push(id);
          }
        });
        
        return newSelectedPermissions;
      }
    });
  }, []);

  return {
    selectedPermissions,
    setSelectedPermissions,
    handlePermissionToggle,
    handleModuleToggle
  };
};

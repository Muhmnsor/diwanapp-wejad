import { useState } from "react";
import { Module } from "../types";

export const usePermissionOperations = (initialPermissions: string[] = []) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(initialPermissions);

  // Toggle a single permission
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Toggle all permissions in a module
  const handleModuleToggle = (module: Module) => {
    const modulePermissionIds = module.permissions.map(p => p.id);
    const areAllSelected = module.permissions.every(permission => 
      selectedPermissions.includes(permission.id)
    );
    
    if (areAllSelected) {
      // Deselect all module permissions
      setSelectedPermissions(prev => prev.filter(id => !modulePermissionIds.includes(id)));
    } else {
      // Select all module permissions
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

  // This function is not used directly anymore, just keeping for reference
  const toggleModuleOpen = (moduleName: string) => {
    // Implementaion moved to usePermissions
    console.log("toggleModuleOpen called with:", moduleName);
  };

  return {
    selectedPermissions,
    setSelectedPermissions,
    handlePermissionToggle,
    handleModuleToggle,
    toggleModuleOpen
  };
};


import { useState } from "react";
import { PermissionData } from "../types";

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
  const handleModuleToggle = (modulePermissions: PermissionData[]) => {
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const areAllSelected = modulePermissions.every(permission => 
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

  return {
    selectedPermissions,
    setSelectedPermissions,
    handlePermissionToggle,
    handleModuleToggle
  };
};

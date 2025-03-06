
import { useState } from "react";

export const usePermissionOperations = () => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handlePermissionToggle = (permissionId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };

  const handleModuleToggle = (modulePermissions: string[], areAllSelected: boolean) => {
    if (areAllSelected) {
      // Remove all permissions in this module
      setSelectedPermissions(prev => 
        prev.filter(id => !modulePermissions.includes(id))
      );
    } else {
      // Add all permissions in this module
      setSelectedPermissions(prev => {
        const newPermissions = modulePermissions.filter(id => !prev.includes(id));
        return [...prev, ...newPermissions];
      });
    }
  };

  const toggleModuleOpen = (moduleName: string, modules: any[], setModules: (modules: any[]) => void) => {
    setModules(modules.map(m => 
      m.name === moduleName ? { ...m, isOpen: !m.isOpen } : m
    ));
  };

  return {
    selectedPermissions,
    setSelectedPermissions,
    handlePermissionToggle,
    handleModuleToggle,
    toggleModuleOpen
  };
};

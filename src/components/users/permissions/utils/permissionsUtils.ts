
import { Module, Permission } from "../types";

// Organize permissions into modules
export const organizePermissionsByModule = (permissions: Permission[]): Module[] => {
  if (permissions.length === 0) {
    return [];
  }
  
  const moduleMap: { [key: string]: Permission[] } = {};
  
  // Group permissions by module
  permissions.forEach(permission => {
    if (!moduleMap[permission.module]) {
      moduleMap[permission.module] = [];
    }
    moduleMap[permission.module].push(permission);
  });
  
  // Convert map to array of modules
  return Object.keys(moduleMap).map(moduleName => ({
    name: moduleName,
    permissions: moduleMap[moduleName],
    isOpen: true // Open by default
  }));
};

// Check if all permissions in a module are selected
export const areAllModulePermissionsSelected = (
  module: Module, 
  selectedPermissions: string[]
): boolean => {
  return module.permissions.every(permission => 
    selectedPermissions.includes(permission.id)
  );
};

// Check if some permissions in a module are selected
export const areSomeModulePermissionsSelected = (
  module: Module, 
  selectedPermissions: string[]
): boolean => {
  const allSelected = areAllModulePermissionsSelected(module, selectedPermissions);
  return module.permissions.some(permission => 
    selectedPermissions.includes(permission.id)
  ) && !allSelected;
};

import { Module, PermissionData, MODULE_TRANSLATIONS } from "../types";

// Function to translate module names to user-friendly display names
const getModuleDisplayName = (moduleName: string): string => {
  // If we have a translation in our mapping, use it
  if (MODULE_TRANSLATIONS[moduleName]) {
    return MODULE_TRANSLATIONS[moduleName];
  }
  
  // Otherwise try to make it presentable (capitalize first letter)
  return moduleName.charAt(0).toUpperCase() + moduleName.slice(1).replace(/_/g, ' ');
};

// Function to organize permissions by module
export const organizePermissionsByModule = (permissions: PermissionData[]): Module[] => {
  if (!permissions || permissions.length === 0) {
    return [];
  }
  
  // Group permissions by module
  const moduleGroups: Record<string, PermissionData[]> = {};
  
  permissions.forEach(permission => {
    const moduleName = permission.module || 'general';
    
    if (!moduleGroups[moduleName]) {
      moduleGroups[moduleName] = [];
    }
    
    moduleGroups[moduleName].push(permission);
  });
  
  // Create module objects from groups
  return Object.entries(moduleGroups).map(([moduleName, modulePermissions]) => ({
    name: moduleName,
    displayName: getModuleDisplayName(moduleName),
    permissions: modulePermissions,
    isOpen: false
  }));
};

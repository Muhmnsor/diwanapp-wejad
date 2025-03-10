
import { Module, PermissionData } from "../types";

// Organize permissions by module
export const organizePermissionsByModule = (permissions: PermissionData[]): Module[] => {
  const moduleMap: Record<string, PermissionData[]> = {};
  
  permissions.forEach(permission => {
    if (!moduleMap[permission.module]) {
      moduleMap[permission.module] = [];
    }
    moduleMap[permission.module].push(permission);
  });
  
  // Make sure tasks module includes general tasks permissions
  if (moduleMap["tasks"] && !moduleMap["general_tasks"]) {
    const generalTaskPermissions = permissions.filter(p => 
      p.name.toString().includes("general_task") || p.description.includes("مهام عامة")
    );
    
    if (generalTaskPermissions.length > 0) {
      moduleMap["tasks"] = [...moduleMap["tasks"], ...generalTaskPermissions];
    }
  }
  
  return Object.entries(moduleMap).map(([name, perms]) => ({
    name,
    permissions: perms.sort((a, b) => a.name.toString().localeCompare(b.name.toString())),
    isOpen: false
  }));
};

export const checkAllModulePermissionsSelected = (
  modulePermissions: string[],
  selectedPermissions: string[]
): boolean => {
  return modulePermissions.every(permId => selectedPermissions.includes(permId));
};

export const checkSomeModulePermissionsSelected = (
  modulePermissions: string[],
  selectedPermissions: string[]
): boolean => {
  return modulePermissions.some(permId => selectedPermissions.includes(permId)) &&
         !checkAllModulePermissionsSelected(modulePermissions, selectedPermissions);
};

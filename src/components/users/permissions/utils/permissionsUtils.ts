
import { Module, PermissionData } from '../types';

export const groupPermissionsByModule = (permissions: PermissionData[]): Module[] => {
  if (!permissions || permissions.length === 0) {
    return [];
  }

  // Create a map to group permissions by module
  const moduleMap = new Map<string, PermissionData[]>();
  
  // Group permissions by their module key
  permissions.forEach(permission => {
    const moduleKey = permission.key.split('.')[0];
    if (!moduleMap.has(moduleKey)) {
      moduleMap.set(moduleKey, []);
    }
    moduleMap.get(moduleKey)?.push(permission);
  });
  
  // Convert the map to the Module array format
  const modules: Module[] = Array.from(moduleMap.entries()).map(([key, permissions]) => {
    return {
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      key: key,
      description: `${key} module permissions`,
      permissions,
      isOpen: false
    };
  });
  
  return modules;
};

// Alias the function to match the expected import
export const organizePermissionsByModule = groupPermissionsByModule;

export const toggleModule = (modules: Module[], moduleId: string): Module[] => {
  return modules.map(module => {
    if (module.id === moduleId) {
      return { ...module, isOpen: !module.isOpen };
    }
    return module;
  });
};

export const updatePermission = (
  modules: Module[],
  moduleId: string,
  permissionId: string,
  isGranted: boolean
): Module[] => {
  return modules.map(module => {
    if (module.id === moduleId) {
      const updatedPermissions = module.permissions.map(permission => {
        if (permission.id === permissionId) {
          return { ...permission, isGranted };
        }
        return permission;
      });
      return { ...module, permissions: updatedPermissions };
    }
    return module;
  });
};

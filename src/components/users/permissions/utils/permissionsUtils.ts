
import { Module, PermissionData, Category, PermissionGroup } from "../types";

/**
 * تنظيم الأذونات حسب الوحدة
 */
export const organizePermissionsByModule = (permissions: PermissionData[]): Module[] => {
  // تجميع الأذونات حسب الوحدة
  const moduleMap: Record<string, PermissionData[]> = {};
  
  permissions.forEach(permission => {
    if (!moduleMap[permission.module]) {
      moduleMap[permission.module] = [];
    }
    moduleMap[permission.module].push(permission);
  });
  
  // تحويل التجميع إلى مصفوفة من كائنات الوحدة
  const modules: Module[] = Object.entries(moduleMap).map(([name, modulePermissions]) => {
    // Get module display name (replace underscores with spaces and capitalize)
    const displayName = formatModuleName(name);
    
    // Process categories if they exist
    const categorizedPermissions = organizePermissionsByCategory(modulePermissions);
    
    return {
      name,
      displayName,
      permissions: modulePermissions,
      isOpen: false, // مغلقة افتراضيًا
      categories: categorizedPermissions
    };
  });
  
  // ترتيب الوحدات أبجديًا
  return modules.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * تنظيم الأذونات حسب الفئة داخل الوحدة
 */
export const organizePermissionsByCategory = (permissions: PermissionData[]): Category[] => {
  // Group permissions by category
  const categories: Record<string, PermissionData[]> = {};
  
  permissions.forEach(permission => {
    const category = permission.category || 'general';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(permission);
  });
  
  // Convert to array of Category objects
  return Object.entries(categories).map(([name, perms]) => ({
    name,
    displayName: formatCategoryName(name),
    permissions: perms
  }));
};

/**
 * Reorganize permissions into a more structured format for the UI
 */
export const organizePermissionsForUI = (permissions: PermissionData[]): PermissionGroup[] => {
  const modules = new Map<string, PermissionGroup>();
  
  // Group permissions by module and category
  permissions.forEach(permission => {
    const moduleName = permission.module;
    const category = permission.category || 'general';
    
    if (!modules.has(moduleName)) {
      modules.set(moduleName, {
        module: moduleName,
        moduleDisplayName: formatModuleName(moduleName),
        categories: {}
      });
    }
    
    const moduleGroup = modules.get(moduleName)!;
    
    if (!moduleGroup.categories[category]) {
      moduleGroup.categories[category] = {
        displayName: formatCategoryName(category),
        permissions: []
      };
    }
    
    moduleGroup.categories[category].permissions.push(permission);
  });
  
  // Convert map to array and sort
  return Array.from(modules.values()).sort((a, b) => 
    a.moduleDisplayName.localeCompare(b.moduleDisplayName)
  );
};

/**
 * Format a module name for display
 */
export const formatModuleName = (name: string): string => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format a category name for display
 */
export const formatCategoryName = (name: string): string => {
  // Map of known category names to their Arabic display names
  const categoryDisplayNames: Record<string, string> = {
    'general': 'عام',
    'access': 'الوصول',
    'create': 'إنشاء',
    'read': 'عرض',
    'update': 'تحديث',
    'delete': 'حذف',
    'admin': 'إدارة',
    'workflow': 'سير العمل',
    'reports': 'التقارير',
    'settings': 'الإعدادات'
  };
  
  return categoryDisplayNames[name] || 
    name.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
};

/**
 * التحقق مما إذا كان المستخدم لديه إذن معين
 */
export const hasPermission = (userPermissions: string[], permissionName: string): boolean => {
  return userPermissions.includes(permissionName);
};

/**
 * تحويل الأذونات من التنسيق الداخلي إلى تنسيق واجهة المستخدم
 */
export const formatPermissionName = (name: string): string => {
  // تحويل snake_case إلى كلمات بحروف كبيرة
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

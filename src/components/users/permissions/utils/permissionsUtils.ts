
import { Module, PermissionData } from "../types";

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
  const modules: Module[] = Object.entries(moduleMap).map(([name, modulePermissions]) => ({
    name,
    permissions: modulePermissions,
    isOpen: false // مغلقة افتراضيًا
  }));
  
  // ترتيب الوحدات أبجديًا
  return modules.sort((a, b) => a.name.localeCompare(b.name));
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

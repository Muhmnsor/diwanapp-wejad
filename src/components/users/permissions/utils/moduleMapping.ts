
// Map of module names to display names
const moduleDisplayNames: Record<string, string> = {
  'admin': 'الإدارة',
  'events': 'الفعاليات',
  'users': 'المستخدمين',
  'finance': 'المالية',
  'dashboard': 'لوحة التحكم',
  'reports': 'التقارير',
  'settings': 'الإعدادات',
  'tasks': 'المهام',
  'documents': 'المستندات',
  'ideas': 'الأفكار',
  'communications': 'الاتصالات',
  'requests': 'الطلبات',
  'website': 'الموقع الإلكتروني',
  'store': 'المتجر',
  'developer': 'المطور'
};

/**
 * Get the display name for a module
 * @param moduleName The technical module name
 * @returns The human-readable display name
 */
export function getModuleDisplayName(moduleName: string): string {
  return moduleDisplayNames[moduleName] || moduleName;
}

/**
 * Generate a permission name from module and action
 * @param module The module name
 * @param action The action name
 * @returns The formatted permission name
 */
export function formatPermissionName(module: string, action: string): string {
  return `${module}.${action}`;
}

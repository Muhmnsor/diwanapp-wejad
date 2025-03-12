
export interface DeveloperPermissionChecks {
  canAccessDeveloperTools: boolean;
  canModifySystemSettings: boolean;
  canAccessApiLogs: boolean;
}

export interface PermissionData {
  id: string;
  name: string;
  description: string;
  module: string;
  category?: string;
  display_name?: string;
}

export interface Module {
  name: string;
  displayName?: string;
  permissions: PermissionData[];
  isOpen: boolean;
  categories?: Category[];
}

export interface Category {
  name: string;
  displayName: string;
  permissions: PermissionData[];
}

export interface PermissionGroup {
  module: string;
  moduleDisplayName: string;
  categories: {
    [key: string]: {
      displayName: string;
      permissions: PermissionData[];
    }
  }
}

// Module translation mapping to standardize module names
export const MODULE_TRANSLATIONS: Record<string, string> = {
  // Arabic to English
  'الفعاليات': 'events',
  'المستخدمين': 'users',
  'المهام': 'tasks',
  'المستندات': 'documents',
  'الأفكار': 'ideas',
  'الإعدادات': 'settings',
  'الإشعارات': 'notifications',
  'أدوات_المطور': 'developer',
  
  // English to Arabic (for display)
  'events': 'الفعاليات',
  'users': 'المستخدمين',
  'tasks': 'المهام',
  'documents': 'المستندات',
  'ideas': 'الأفكار',
  'settings': 'الإعدادات',
  'notifications': 'الإشعارات',
  'developer': 'أدوات المطور',
  'requests': 'الطلبات'
};

// Standardized permission categories with translations
export const PERMISSION_CATEGORIES: Record<string, string> = {
  'access': 'الوصول',
  'create': 'إنشاء',
  'read': 'عرض',
  'update': 'تعديل',
  'delete': 'حذف',
  'admin': 'إدارة',
  'workflow': 'سير العمل',
  'general': 'عام'
};


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
  description?: string;
  permissions: PermissionData[];
  isOpen?: boolean;
  isAllSelected?: boolean;
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

// Module translation mapping to standardize module names (Arabic values are canonical)
export const MODULE_TRANSLATIONS: Record<string, string> = {
  // English to Arabic (for display)
  'events': 'الفعاليات',
  'users': 'المستخدمين',
  'tasks': 'المهام',
  'documents': 'المستندات',
  'ideas': 'الأفكار',
  'settings': 'الإعدادات',
  'notifications': 'الإشعارات',
  'developer': 'أدوات المطور',
  'requests': 'الطلبات',
  'finance': 'المالية',
  'website': 'الموقع الإلكتروني',
  'store': 'المتجر الإلكتروني',
  'hr': 'شؤون الموظفين',
  'accounting': 'المحاسبة',
  'meetings': 'الاجتماعات',
  'internal_mail': 'البريد الداخلي',
  'subscriptions': 'الاشتراكات',
  
  // Arabic to English (for technical mapping)
  'الفعاليات': 'events',
  'المستخدمين': 'users',
  'المهام': 'tasks',
  'المستندات': 'documents',
  'الأفكار': 'ideas',
  'الإعدادات': 'settings',
  'الإشعارات': 'notifications',
  'أدوات المطور': 'developer',
  'الطلبات': 'requests',
  'المالية': 'finance',
  'الموقع الإلكتروني': 'website',
  'المتجر الإلكتروني': 'store',
  'شؤون الموظفين': 'hr',
  'المحاسبة': 'accounting',
  'الاجتماعات': 'meetings',
  'البريد الداخلي': 'internal_mail',
  'الاشتراكات': 'subscriptions'
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
  'general': 'عام',
  'reports': 'التقارير',
  'settings': 'الإعدادات',
  'users': 'المستخدمين',
  'participants': 'المشاركين',
  'approvals': 'الموافقات',
  'comments': 'التعليقات',
  'attachments': 'المرفقات'
};

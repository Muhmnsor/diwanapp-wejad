
import { PermissionGroup } from "@/components/users/permissions/types";

export const applicationModules = [
  { id: 'events', name: 'فعاليات', description: 'إدارة الفعاليات والأنشطة' },
  { id: 'documents', name: 'مستندات', description: 'إدارة الوثائق والمستندات' },
  { id: 'tasks', name: 'مهام', description: 'إدارة المهام وسير العمل' },
  { id: 'finance', name: 'مالية', description: 'إدارة العمليات المالية والميزانيات' },
  { id: 'projects', name: 'مشاريع', description: 'إدارة المشاريع والخطط' },
  { id: 'requests', name: 'طلبات', description: 'إدارة طلبات المستخدمين' },
  { id: 'users', name: 'مستخدمين', description: 'إدارة المستخدمين والصلاحيات' },
  { id: 'settings', name: 'إعدادات', description: 'إدارة إعدادات النظام' },
  { id: 'apps_visibility', name: 'ظهور التطبيقات', description: 'التحكم في ظهور التطبيقات في النظام' },
];

export const permissionGroups: PermissionGroup[] = [
  {
    module: 'documents',
    displayName: 'المستندات',
    description: 'إدارة المستندات والوثائق',
    permissions: [
      { id: 'documents_view', name: 'documents_view', description: 'عرض المستندات', module: 'documents' },
      { id: 'documents_create', name: 'documents_create', description: 'إنشاء مستندات جديدة', module: 'documents' },
      { id: 'documents_edit', name: 'documents_edit', description: 'تعديل المستندات', module: 'documents' },
      { id: 'documents_delete', name: 'documents_delete', description: 'حذف المستندات', module: 'documents' },
      { id: 'documents_download', name: 'documents_download', description: 'تنزيل المستندات', module: 'documents' },
      { id: 'documents_approve', name: 'documents_approve', description: 'اعتماد المستندات', module: 'documents' },
    ]
  },
  {
    module: 'events',
    displayName: 'الفعاليات',
    description: 'إدارة الفعاليات والأنشطة',
    permissions: [
      { id: 'events_view', name: 'events_view', description: 'عرض الفعاليات', module: 'events' },
      { id: 'events_create', name: 'events_create', description: 'إنشاء فعاليات جديدة', module: 'events' },
      { id: 'events_edit', name: 'events_edit', description: 'تعديل الفعاليات', module: 'events' },
      { id: 'events_delete', name: 'events_delete', description: 'حذف الفعاليات', module: 'events' },
      { id: 'events_register', name: 'events_register', description: 'التسجيل في الفعاليات', module: 'events' },
      { id: 'events_manage_registrations', name: 'events_manage_registrations', description: 'إدارة تسجيلات الفعاليات', module: 'events' },
    ]
  },
  {
    module: 'tasks',
    displayName: 'المهام',
    description: 'إدارة المهام وسير العمل',
    permissions: [
      { id: 'tasks_view', name: 'tasks_view', description: 'عرض المهام', module: 'tasks' },
      { id: 'tasks_create', name: 'tasks_create', description: 'إنشاء مهام جديدة', module: 'tasks' },
      { id: 'tasks_edit', name: 'tasks_edit', description: 'تعديل المهام', module: 'tasks' },
      { id: 'tasks_delete', name: 'tasks_delete', description: 'حذف المهام', module: 'tasks' },
      { id: 'tasks_assign', name: 'tasks_assign', description: 'إسناد المهام', module: 'tasks' },
      { id: 'tasks_complete', name: 'tasks_complete', description: 'إكمال المهام', module: 'tasks' },
    ]
  },
  {
    module: 'finance',
    displayName: 'المالية',
    description: 'إدارة العمليات المالية والميزانيات',
    permissions: [
      { id: 'finance_view', name: 'finance_view', description: 'عرض البيانات المالية', module: 'finance' },
      { id: 'finance_create', name: 'finance_create', description: 'إنشاء سجلات مالية جديدة', module: 'finance' },
      { id: 'finance_edit', name: 'finance_edit', description: 'تعديل السجلات المالية', module: 'finance' },
      { id: 'finance_delete', name: 'finance_delete', description: 'حذف السجلات المالية', module: 'finance' },
      { id: 'finance_approve', name: 'finance_approve', description: 'اعتماد العمليات المالية', module: 'finance' },
      { id: 'finance_export', name: 'finance_export', description: 'تصدير التقارير المالية', module: 'finance' },
    ]
  },
  {
    module: 'projects',
    displayName: 'المشاريع',
    description: 'إدارة المشاريع والخطط',
    permissions: [
      { id: 'projects_view', name: 'projects_view', description: 'عرض المشاريع', module: 'projects' },
      { id: 'projects_create', name: 'projects_create', description: 'إنشاء مشاريع جديدة', module: 'projects' },
      { id: 'projects_edit', name: 'projects_edit', description: 'تعديل المشاريع', module: 'projects' },
      { id: 'projects_delete', name: 'projects_delete', description: 'حذف المشاريع', module: 'projects' },
      { id: 'projects_manage_members', name: 'projects_manage_members', description: 'إدارة أعضاء المشروع', module: 'projects' },
      { id: 'projects_manage_activities', name: 'projects_manage_activities', description: 'إدارة أنشطة المشروع', module: 'projects' },
    ]
  },
  {
    module: 'requests',
    displayName: 'الطلبات',
    description: 'إدارة طلبات المستخدمين',
    permissions: [
      { id: 'requests_view', name: 'requests_view', description: 'عرض الطلبات', module: 'requests' },
      { id: 'requests_create', name: 'requests_create', description: 'إنشاء طلبات جديدة', module: 'requests' },
      { id: 'requests_edit', name: 'requests_edit', description: 'تعديل الطلبات', module: 'requests' },
      { id: 'requests_delete', name: 'requests_delete', description: 'حذف الطلبات', module: 'requests' },
      { id: 'requests_approve', name: 'requests_approve', description: 'اعتماد الطلبات', module: 'requests' },
      { id: 'requests_reject', name: 'requests_reject', description: 'رفض الطلبات', module: 'requests' },
    ]
  },
  {
    module: 'users',
    displayName: 'المستخدمين',
    description: 'إدارة المستخدمين والصلاحيات',
    permissions: [
      { id: 'users_view', name: 'users_view', description: 'عرض المستخدمين', module: 'users' },
      { id: 'users_create', name: 'users_create', description: 'إنشاء مستخدمين جدد', module: 'users' },
      { id: 'users_edit', name: 'users_edit', description: 'تعديل بيانات المستخدمين', module: 'users' },
      { id: 'users_delete', name: 'users_delete', description: 'حذف المستخدمين', module: 'users' },
      { id: 'users_manage_roles', name: 'users_manage_roles', description: 'إدارة أدوار المستخدمين', module: 'users' },
    ]
  },
  {
    module: 'settings',
    displayName: 'الإعدادات',
    description: 'إدارة إعدادات النظام',
    permissions: [
      { id: 'settings_view', name: 'settings_view', description: 'عرض الإعدادات', module: 'settings' },
      { id: 'settings_edit', name: 'settings_edit', description: 'تعديل الإعدادات', module: 'settings' },
      { id: 'settings_manage_system', name: 'settings_manage_system', description: 'إدارة إعدادات النظام', module: 'settings' },
    ]
  },
  {
    module: 'apps_visibility',
    displayName: 'ظهور التطبيقات',
    description: 'التحكم في ظهور التطبيقات في النظام',
    permissions: [
      { id: 'view_events_app', name: 'view_events_app', description: 'عرض تطبيق الفعاليات', module: 'apps_visibility' },
      { id: 'view_documents_app', name: 'view_documents_app', description: 'عرض تطبيق المستندات', module: 'apps_visibility' },
      { id: 'view_tasks_app', name: 'view_tasks_app', description: 'عرض تطبيق المهام', module: 'apps_visibility' },
      { id: 'view_finance_app', name: 'view_finance_app', description: 'عرض تطبيق المالية', module: 'apps_visibility' },
      { id: 'view_projects_app', name: 'view_projects_app', description: 'عرض تطبيق المشاريع', module: 'apps_visibility' },
      { id: 'view_requests_app', name: 'view_requests_app', description: 'عرض تطبيق الطلبات', module: 'apps_visibility' },
    ]
  },
  {
    module: 'developer',
    displayName: 'أدوات المطور',
    description: 'أدوات وإعدادات المطور',
    permissions: [
      { id: 'developer_view_logs', name: 'developer_view_logs', description: 'عرض سجلات النظام', module: 'developer' },
      { id: 'developer_manage_permissions', name: 'developer_manage_permissions', description: 'إدارة الصلاحيات', module: 'developer' },
      { id: 'developer_manage_system', name: 'developer_manage_system', description: 'إدارة النظام', module: 'developer' },
      { id: 'developer_access_tools', name: 'developer_access_tools', description: 'الوصول لأدوات المطور', module: 'developer' },
    ]
  }
];

export const getPermissionsByModule = (module: string): PermissionData[] => {
  const group = permissionGroups.find(g => g.module === module);
  return group ? group.permissions : [];
};

export const getAllPermissions = (): PermissionData[] => {
  return permissionGroups.flatMap(group => group.permissions);
};

export const getModuleDisplayName = (moduleId: string): string => {
  const module = applicationModules.find(m => m.id === moduleId);
  return module ? module.name : moduleId;
};

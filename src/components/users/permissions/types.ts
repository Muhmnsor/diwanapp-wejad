
export interface PermissionData {
  id: string;
  name: string;
  description: string;
  module: string;
  created_at?: string;
  updated_at?: string;
}

export interface Module {
  name: string;
  permissions: PermissionData[];
  isOpen: boolean;
}

// تعريف أنواع الأذونات
export type DeveloperPermission = 
  | 'view_developer_tools'
  | 'modify_system_settings'
  | 'access_api_logs'
  | 'manage_developer_settings'
  | 'view_performance_metrics';

export type UserPermission = 
  | 'create_user'
  | 'update_user'
  | 'delete_user'
  | 'view_users';

export type EventPermission = 
  | 'create_event'
  | 'update_event'
  | 'delete_event'
  | 'view_events';

export type TaskPermission = 
  | 'create_task'
  | 'update_task'
  | 'delete_task'
  | 'view_tasks';

export type ProjectPermission = 
  | 'create_project'
  | 'update_project'
  | 'delete_project'
  | 'view_projects';

// تعريف النوع الرئيسي للأذونات
export type Permission = 
  | DeveloperPermission
  | UserPermission
  | EventPermission
  | TaskPermission
  | ProjectPermission;

// إضافة دعم التحقق من صلاحيات المطور
export interface DeveloperPermissionChecks {
  canAccessDeveloperTools: boolean;
  canModifySystemSettings: boolean;
  canAccessApiLogs: boolean;
  canManageDeveloperSettings: boolean;
  canViewPerformanceMetrics: boolean;
}

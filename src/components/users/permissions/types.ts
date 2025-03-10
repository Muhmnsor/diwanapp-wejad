
export type DeveloperPermission = 
  | 'view_developer_tools'
  | 'manage_developer_settings'
  | 'view_performance_metrics';

export type UserPermission =
  | 'view_users'
  | 'create_users'
  | 'edit_users'
  | 'delete_users';

export type EventPermission =
  | 'create_events'
  | 'edit_events'
  | 'delete_events'
  | 'approve_events';

export type TaskPermission =
  | 'create_tasks'
  | 'edit_tasks'
  | 'delete_tasks'
  | 'assign_tasks';

export type ProjectPermission =
  | 'create_projects'
  | 'edit_projects'
  | 'delete_projects'
  | 'approve_projects';

export type Permission =
  | UserPermission
  | EventPermission
  | TaskPermission
  | ProjectPermission
  | DeveloperPermission;

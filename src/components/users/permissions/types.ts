
export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface Module {
  name: string;
  permissions: Permission[];
  isOpen: boolean;
}

// New developer permission types
export type DeveloperPermission = 
  | 'view_developer_tools'
  | 'manage_developer_settings'
  | 'view_performance_metrics';


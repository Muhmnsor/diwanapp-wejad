
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
  type?: string;
  is_active?: boolean;
}

export interface Module {
  name: string;
  permissions: PermissionData[];
  isOpen: boolean;
}

export interface ApplicationPermission {
  module: string;
  actions: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    download: boolean;
    manage: boolean;
  };
}

export interface PermissionGroup {
  module: string;
  displayName: string;
  description: string;
  permissions: PermissionData[];
}

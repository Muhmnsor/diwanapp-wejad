
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


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
}

export interface Module {
  name: string;
  permissions: PermissionData[];
  isOpen: boolean;
}

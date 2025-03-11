
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

export interface ModuleHeaderProps {
  moduleName: string;
  moduleDisplayName: string;
  areAllSelected: boolean;
  areSomeSelected: boolean;
  onModuleToggle: (moduleName: string) => void;
  onToggleOpen: (moduleName: string) => void;
  isOpen: boolean;
}

export interface PermissionGroupProps {
  permissions: PermissionData[];
  selectedPermissions: string[];
  onPermissionToggle: (permissionId: string) => void;
}

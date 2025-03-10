
export interface DeveloperPermissionChecks {
  canAccessDeveloperTools: boolean;
  canModifySystemSettings: boolean;
  canAccessApiLogs: boolean;
  canManageDeveloperSettings: boolean;
  canViewPerformanceMetrics: boolean;
  canDebugQueries: boolean;
  canManageRealtime: boolean;
  canAccessAdminPanel: boolean;
  canExportData: boolean;
  canImportData: boolean;
}

export interface PermissionData {
  id: string;
  name: string;
  description: string;
  key: string;
  isGranted: boolean;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  key: string;
  permissions: PermissionData[];
}

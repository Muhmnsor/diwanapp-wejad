
import { 
  DeveloperPermission, 
  UserPermission, 
  EventPermission, 
  TaskPermission, 
  ProjectPermission,
  Permission
} from '@/components/users/permissions/types';

export interface PermissionData {
  id: string;
  name: Permission;
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

// قم بتصدير الأنواع التي تم استيرادها لمنع تعارض التعريفات المتكررة
export type { 
  DeveloperPermission, 
  UserPermission, 
  EventPermission, 
  TaskPermission, 
  ProjectPermission,
  Permission 
} from '@/components/users/permissions/types';

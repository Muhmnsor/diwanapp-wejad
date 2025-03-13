
export interface User {
  id: string;
  username: string;
  role: string;
  lastLogin: string;
  displayName?: string;  // إضافة حقل المسمى الوظيفي
  isActive?: boolean;    // إضافة حقل حالة المستخدم
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface UserRoleData {
  user_id: string;
  roles: Role;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  details: string;
  created_at: string;
}

export interface Permission {
  id: string;
  app_name: string;
  role_id: string;
}

export interface RequestStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageApprovalTime?: number;
  requestsByType?: {
    typeId: string;
    typeName: string;
    count: number;
  }[];
  requestsByStatus?: {
    status: string;
    count: number;
  }[];
  requestsByMonth?: {
    month: string;
    count: number;
  }[];
}

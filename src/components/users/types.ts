
export interface User {
  id: string;
  username: string;
  displayName?: string;
  role: string;
  lastLogin?: string;
  isActive?: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

// Add UserRoleData type for useUserRoles.tsx
export interface UserRoleData {
  user_id: string;
  roles: {
    id: string;
    name: string;
    description?: string;
  };
}

// Add UserActivity type for UserActivityList.tsx
export interface UserActivity {
  id: string;
  userId: string;
  activityType: string;
  details?: string;
  timestamp: string;
  user?: {
    username: string;
    displayName?: string;
  };
}

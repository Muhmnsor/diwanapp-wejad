
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

// Update UserRoleData interface to match the joined structure from Supabase
export interface UserRoleData {
  user_id: string;
  roles: Role | Role[] | null;
}

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

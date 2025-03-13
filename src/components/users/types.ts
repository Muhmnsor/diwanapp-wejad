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

// Update UserRoleData type to match the joined structure from Supabase
export interface UserRoleData {
  user_id: string;
  roles: {
    id: string;
    name: string;
    description?: string;
  };
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

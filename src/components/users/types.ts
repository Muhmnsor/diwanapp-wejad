
export interface User {
  id: string;
  username: string;
  role: string;
  lastLogin: string;
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

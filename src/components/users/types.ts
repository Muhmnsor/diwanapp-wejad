
export interface User {
  id: string;
  username: string;
  displayName?: string;
  role: string;
  roleId?: string | null; // Adding roleId to support editing
  lastLogin?: string;
  isActive?: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface UserRoleData {
  id: string;
  user_id: string;
  role_id: string;
  roles: Role;
}

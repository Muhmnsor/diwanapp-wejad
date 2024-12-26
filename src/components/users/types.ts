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

export interface UserRoleResponse {
  user_id: string;
  roles: {
    name: string;
    description: string;
  }[];
}
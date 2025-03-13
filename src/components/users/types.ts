
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

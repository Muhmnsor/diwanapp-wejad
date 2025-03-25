
export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  role?: string; // Add the role property as optional
  display_name?: string; // Add display_name as optional since it might not be available immediately in auth context
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

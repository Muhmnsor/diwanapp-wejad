
export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  role?: string; // Add the role property as optional
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

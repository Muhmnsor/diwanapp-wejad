
export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  role?: string;
  isDeveloper?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  checkDeveloperStatus: (userId: string) => Promise<boolean>;
}

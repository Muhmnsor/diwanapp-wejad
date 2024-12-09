import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (username: string, password: string) => {
    // في التطبيق الحقيقي، يجب التحقق من بيانات المستخدم مع الخادم
    if (username === "admin" && password === "admin123") {
      set({
        user: {
          id: "1",
          username: username,
          isAdmin: true
        },
        isAuthenticated: true
      });
    } else {
      throw new Error("بيانات تسجيل الدخول غير صحيحة");
    }
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  }
}));
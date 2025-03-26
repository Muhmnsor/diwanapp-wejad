
// Define a standardized User interface to be used throughout the application
export interface User {
  id: string;
  email: string;
  display_name: string; // جعلها إلزامية
  role?: string;
  isAdmin?: boolean;
  created_at?: string;
  updated_at?: string;
}

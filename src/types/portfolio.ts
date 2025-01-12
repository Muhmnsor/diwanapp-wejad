export interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  asana_gid?: string;
  created_at?: string;
  updated_at?: string;
}
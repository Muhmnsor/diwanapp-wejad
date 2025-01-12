export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  asana_gid?: string;
  created_at: string;
  updated_at: string;
  asana_folder_gid?: string;
  asana_sync_enabled?: boolean;
}
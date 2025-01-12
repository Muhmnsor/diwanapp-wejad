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

export interface PortfolioProject {
  id: string;
  portfolio_id: string;
  project_id: string;
  asana_gid?: string;
  created_at: string;
  asana_status?: string;
  asana_priority?: string;
  project: {
    id: string;
    title: string;
    description?: string;
    image_url: string;
    start_date: string;
    end_date: string;
  };
}
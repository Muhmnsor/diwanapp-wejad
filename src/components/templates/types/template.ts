
export interface Template {
  id: string;
  name: string;
  department: string;
  template_number: string;
  description?: string;
  category?: string;
  file_path?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  downloads?: number;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  version?: string;
  status?: 'active' | 'archived' | 'draft';
}

export interface TemplateStats {
  total: number;
  byDepartment: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface TemplateFilterOptions {
  departments: string[];
  categories: string[];
}

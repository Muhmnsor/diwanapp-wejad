
export interface Idea {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string | null;
  created_at: string;
  created_by: string;
  creator_email?: string;
  creator_display_name?: string;
  discussion_period: string | null;
  proposed_execution_date: string;
}

export interface IdeasTableProps {
  ideas: Idea[];
  isLoading: boolean;
  filterStatus: string | null;
  setFilterStatus: (status: string | null) => void;
  onDelete: (idea: Idea) => void;
}

export interface AddIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface Department {
  name: string;
  contribution: string;
}

export interface Partner {
  name: string;
  contribution: string;
}

export interface CostItem {
  item: string;
  quantity: number;
  total_cost: number;
}

export interface SimilarIdea {
  title: string;
  link: string;
}

export interface SupportingFile {
  name: string;
  file: File | null;
}

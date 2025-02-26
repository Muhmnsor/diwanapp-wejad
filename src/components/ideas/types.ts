
export interface Idea {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string | null;
  created_at: string;
  created_by: string;
  creator_email?: string;
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


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

export type IdeaStatus = 'draft' | 'under_review' | 'approved' | 'rejected' | 'archived';

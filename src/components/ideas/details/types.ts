
export interface Vote {
  vote_type: 'up' | 'down';
  user_id: string;
  idea_id: string;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  idea_id: string;
  parent_id: string | null;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string | null;
  created_at: string;
  created_by: string;
  discussion_period: string;
  opportunity: string;
  problem: string;
  benefits: string;
  required_resources: string;
  contributing_departments: { name: string; contribution: string }[];
  expected_costs: { item: string; quantity: number; total_cost: number }[];
  expected_partners: { name: string; contribution: string }[];
  proposed_execution_date: string;
  similar_ideas: { title: string; link: string }[];
  supporting_files: { name: string; file_path: string }[];
  duration: string;
  idea_type: string;
}

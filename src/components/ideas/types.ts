
export interface AddIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface CostItem {
  item: string;
  quantity: number;
  total_cost: number;
}

export interface Department {
  name: string;
  contribution: string;
}

export interface Partner {
  name: string;
  contribution: string;
}

export interface SimilarIdea {
  title: string;
  link: string;
  file?: string | File;
}

export interface IdeaFormData {
  title: string;
  description: string;
  opportunity: string;
  problem: string;
  contributing_departments: Department[];
  expected_partners: Partner[];
  benefits: string;
  expected_costs: CostItem[];
  required_resources: string;
  proposed_execution_date: string;
  duration: string;
  idea_type: string;
  similar_ideas: SimilarIdea[];
  status: 'draft' | 'submitted';
}

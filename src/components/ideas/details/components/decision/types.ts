
export interface DecisionProps {
  ideaId: string;
  status: string;
  isAdmin?: boolean; 
  onStatusChange?: () => void;
  ideaTitle?: string;
  decision?: Decision | null;
}

export interface Decision {
  id?: string;
  status: string;
  reason: string;
  assignee?: string;
  timeline?: string;
  budget?: string;
  created_at?: string;
  created_by?: string;
  created_by_name?: string;
}

export interface AssigneeItem {
  id: string;
  name: string;
  responsibility: string;
}

export interface DecisionFormProps {
  ideaId: string;
  initialStatus: string;
  initialReason: string;
  initialTimeline: string;
  initialBudget: string;
  decision?: Decision;
  assignees: AssigneeItem[];
  isEditing: boolean;
  onSave: (status: string, reason: string, timeline: string, budget: string, assignees: AssigneeItem[]) => Promise<void>;
  onCancel: () => void;
}

export interface DecisionDisplayProps {
  decision?: Decision | null;
  status: string;
  reason: string;
  assignees: AssigneeItem[];
  timeline?: string;
  budget?: string;
}

export interface AssigneeListProps {
  assignees: AssigneeItem[];
  onRemove?: (id: string) => void;
  readOnly?: boolean;
}

export interface AssigneeFormProps {
  onAdd: (name: string, responsibility: string) => void;
}

export interface DecisionDeleteDialogProps {
  open: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

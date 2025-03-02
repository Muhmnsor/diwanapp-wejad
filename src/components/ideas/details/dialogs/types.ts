
export interface ExtendDiscussionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  onSuccess: () => void;
}

export interface DiscussionPeriodData {
  discussionPeriod?: string;
  createdAt: string;
  remainingDays: number;
  remainingHours: number;
  totalCurrentHours: number;
  discussionEnded: boolean;
}

export interface ExtendFormData {
  days: number;
  hours: number;
  operation: "add" | "subtract";
}

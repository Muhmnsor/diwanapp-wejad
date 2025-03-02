
export interface ExtendDiscussionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  onSuccess: () => void;
}

export interface IdeaUpdates {
  discussion_period: string;
  status?: string;
}

export interface DiscussionTimeState {
  days: number;
  hours: number;
  remainingDays: number;
  remainingHours: number;
  totalCurrentHours: number;
}

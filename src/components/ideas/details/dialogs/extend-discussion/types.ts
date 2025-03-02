
export interface ExtendDiscussionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  onSuccess: () => void;
}

export interface DiscussionTimeData {
  days: number;
  hours: number;
  totalCurrentHours: number;
  remainingDays: number;
  remainingHours: number;
}

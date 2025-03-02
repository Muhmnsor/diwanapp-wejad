
export interface ExtendDiscussionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  onSuccess: () => void;
}

export interface DiscussionPeriodDisplay {
  days: number;
  hours: number;
}

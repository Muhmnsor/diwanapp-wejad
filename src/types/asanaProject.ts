export interface AsanaProjectFormData {
  title: string;
  description?: string;
  startDate: string;
  dueDate: string;
  status: 'on_track' | 'at_risk' | 'off_track' | 'on_hold';
  priority: 'low' | 'medium' | 'high';
}

export interface AsanaProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId: string;
  onSuccess?: () => void;
}
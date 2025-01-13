export interface PortfolioProjectFormData {
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  status: string;
  privacy: string;
}

export interface CreatePortfolioProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId: string;
  onSuccess?: () => void;
}
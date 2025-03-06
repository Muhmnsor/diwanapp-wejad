
export interface ResourceFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export interface BudgetItem {
  id: string;
  name: string;
  percentage: number;
  value: number;
}

export interface ResourceObligation {
  id?: string;
  amount: number;
  description: string;
}


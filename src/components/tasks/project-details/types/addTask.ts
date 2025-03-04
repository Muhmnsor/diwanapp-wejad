
export type TaskFormData = {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  stageId: string;
  assignedTo: string;
};

export interface User {
  id: string;
  display_name?: string;
  email?: string;
}

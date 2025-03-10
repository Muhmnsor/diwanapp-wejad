export interface WorkflowStep {
  id: string | null;
  workflow_id: string;  // Ensure this is required
  step_order: number;
  step_name: string;
  step_type?: string;
  approver_id: string | null;
  approver_type?: string;
  instructions: string | null;
  is_required?: boolean;
  created_at: string | null;
}

export interface User {
  id: string;
  display_name: string;
  email?: string;
}

export interface RequestType {
  id: string;
  name: string;
  description?: string;
  form_schema: {
    fields?: FormField[];
    [key: string]: any;
  };
  is_active?: boolean;
  default_workflow_id?: string | null;
  created_at?: string;
  created_by?: string | null;
}

export interface FormField {
  id: string;
  type: string;
  label: string;
  name: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  [key: string]: any;
}

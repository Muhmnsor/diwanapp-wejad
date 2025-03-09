
// If this file doesn't exist, we'll create it with the necessary types
export interface User {
  id: string;
  display_name: string;
  email: string;
}

export interface WorkflowStep {
  id?: string;
  workflow_id?: string;
  step_order: number;
  step_name: string;
  step_type: string;
  approver_id: string | null;
  approver_type?: string;
  instructions?: string;
  is_required: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

export interface FormSchema {
  fields: FormField[];
}

export interface RequestType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  form_schema: FormSchema;
  default_workflow_id?: string;
  created_at?: string;
  updated_at?: string;
}

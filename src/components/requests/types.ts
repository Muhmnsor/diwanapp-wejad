
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
  approver_type: string;
  instructions?: string;
  is_required: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "array" | "file";
  required: boolean;
  options?: string[];
  subfields?: FormField[]; // Added for array type fields
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

export interface RequestWorkflow {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  request_type_id?: string;
  created_at?: string;
  updated_by?: string;
  created_by?: string;
}

export interface Request {
  id: string;
  title: string;
  status: string;
  priority: string;
  requester_id: string;
  request_type_id: string;
  workflow_id?: string;
  current_step_id?: string;
  form_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  due_date?: string;
}

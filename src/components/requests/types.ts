export interface WorkflowStep {
  id: string | null;
  workflow_id: string;  // Ensure this is required
  step_order: number;
  step_name: string;
  step_type: string;
  approver_id: string | null;
  approver_type?: string;
  instructions: string | null;
  is_required: boolean;
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
  form_schema: FormSchema;
  is_active?: boolean;
  default_workflow_id?: string | null;
  created_at?: string;
  created_by?: string | null;
}

export interface FormSchema {
  fields: FormField[];
  [key: string]: any;
}

export interface FormField {
  id: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "array" | "file";
  label: string;
  name: string;
  required?: boolean;
  options?: Array<string | { label: string; value: string }>;
  placeholder?: string;
  subfields?: FormField[];
  [key: string]: any;
}

export interface RequestWorkflow {
  id: string;
  name: string;
  description?: string;
  request_type_id?: string;
  is_active?: boolean;
  created_at?: string;
  created_by?: string | null;
}

export interface Request {
  id: string;
  title: string;
  form_data: Record<string, any>;
  status: string;
  priority: string;
  requester_id: string;
  request_type_id: string;
  workflow_id?: string | null;
  current_step_id?: string | null;
  due_date?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface RequestApproval {
  id: string;
  request_id: string;
  step_id: string;
  approver_id: string;
  status: string;
  comments?: string;
  approved_at?: string;
  created_at: string;
}


// Define types for request components

export interface RequestType {
  id: string;
  name: string;
  description?: string;
  form_schema: FormSchema;
  is_active: boolean;
  default_workflow_id?: string | null;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "array" | "file";
  required: boolean;
  placeholder?: string;
  options?: (string | { label: string; value: string })[];
  subfields?: FormField[];
}

export interface FormSchema {
  fields: FormField[];
}

export interface WorkflowStep {
  id: string | null;
  step_name: string;
  step_type: 'decision' | 'opinion' | 'notification';
  approver_id: string;
  is_required: boolean;
  workflow_id: string;
  step_order: number;
  instructions: string | null;
  created_at: string | null;
}

export interface RequestWorkflow {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  request_type_id?: string;
  created_at?: string;
  created_by?: string;
  steps?: WorkflowStep[];
}

// Keep backward compatibility by aliasing RequestWorkflow as Workflow
export type Workflow = RequestWorkflow;

export interface Request {
  id: string;
  title: string;
  form_data: any;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  requester_id: string;
  request_type_id: string;
  workflow_id?: string;
  current_step_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  request_type?: RequestType;
  requester?: {
    id: string;
    display_name?: string;
    email?: string;
  };
}

export interface RequestApproval {
  id: string;
  request_id: string;
  step_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approved_at?: string;
  created_at: string;
}

export interface User {
  id: string;
  username?: string;
  display_name?: string;
  email?: string;
  role?: string;
  lastLogin?: string;
  isActive?: boolean;
}

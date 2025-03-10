
export interface RequestType {
  id: string;
  name: string;
  description: string | null;
  form_schema: FormSchema;
  default_workflow_id: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at?: string;
}

export interface FormSchema {
  fields: FormField[];
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'array' | 'file';
  required: boolean;
  options?: string[];
  subfields?: FormField[];
}

// Alias for FormField to match the naming in the refactored components
export type FormFieldType = FormField;

export interface Request {
  id: string;
  request_type_id: string;
  requester_id: string;
  workflow_id: string | null;
  current_step_id: string | null;
  status: 'draft' | 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled';
  form_data: Record<string, any>;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  display_name: string | null;
  email: string | null;
}

export interface WorkflowStep {
  id: string | null;
  workflow_id: string; // Changed from string | null to string - Required field
  step_order: number;
  step_name: string;
  step_type: 'opinion' | 'decision';
  approver_id: string | null;
  approver_type: string;
  instructions: string | null;
  is_required: boolean;
  created_at: string | null;
}

export interface RequestApproval {
  id: string;
  request_id: string;
  step_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface RequestWorkflow {
  id: string;
  name: string;
  request_type_id: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface RequestAttachment {
  id: string;
  request_id: string;
  approval_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string;
  created_at: string;
}

// Interface for RequestTypeForm
export interface RequestTypeFormValues {
  name: string;
  description?: string;
  is_active: boolean;
  form_schema: {
    fields: FormField[];
  };
}

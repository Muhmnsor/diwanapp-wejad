
// Add this to the existing types file or create if it doesn't exist

export interface FormField {
  id: string;  // Add id property
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  subfields?: FormField[];  // Add subfields property
  default_value?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormSchema {
  title?: string;
  description?: string;
  fields: FormField[];
}

export interface User {
  id: string;
  display_name?: string;
  email?: string;
  role?: string;
  department_id?: string;
  created_at?: string;
}

export interface WorkflowStep {
  id: string;
  step_name?: string;
  step_type?: 'decision' | 'opinion' | 'notification';
  approver_id?: string | null;
  approver_name?: string | null;
  is_required?: boolean;
  step_order?: number;
  instructions?: string | null;
  workflow_id?: string;
  created_at?: string;
}

export interface RequestApproval {
  id: string;
  request_id: string;
  step_id: string;
  step_name?: string;
  step_type?: 'decision' | 'opinion' | 'notification';
  approver_id: string;
  approver_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface RequestAttachment {
  id: string;
  request_id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  created_by: string;
  uploader_name?: string;
  created_at: string;
}

export interface RequestType {
  id: string;
  name: string;
  description?: string;
  form_schema?: FormSchema;
  is_active?: boolean;
  default_workflow_id?: string | null;
}

export interface Requester {
  id: string;
  display_name?: string;
  email?: string;
}

export interface Request {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  requester_id: string;
  request_type_id: string;
  workflow_id?: string;
  current_step_id?: string | null;
  created_at: string;
  updated_at: string;
  form_data?: any;
  requester?: Requester;
}

export interface RequestWorkflow {
  id: string;
  name?: string;
  description?: string;
  is_active?: boolean;
  steps?: WorkflowStep[];
}

export interface RequestDetailData {
  request: Request;
  request_type: RequestType;
  workflow: RequestWorkflow;
  current_step: WorkflowStep | null;
  approvals: RequestApproval[];
  attachments: RequestAttachment[];
  requester: Requester;
  permissions?: {
    is_requester: boolean;
    is_admin: boolean;
    is_in_workflow: boolean;
    has_supervisor_access: boolean;
    can_view: boolean;
    can_view_workflow: boolean;
  };
  debug_info?: any;
}


export interface RequestApproval {
  id: string;
  step?: { 
    step_name?: string;
    id?: string;
    approver_type?: string;
  };
  approver?: { 
    display_name?: string; 
    email?: string;
    id?: string;
  };
  status: "pending" | "approved" | "rejected";
  comments?: string;
  approved_at?: string;
  assignment_type?: "direct" | "role";
}

export interface RequestAttachment {
  id: string;
  file_name: string;
  file_path?: string;
  file_type?: string;
  file_size?: number;
  created_at?: string;
  uploader?: {
    display_name?: string;
    email?: string;
    id?: string;
  };
}

export interface RequestStep {
  id?: string;
  step_name?: string;
  step_order?: number;
  approver_type?: string;
  instructions?: string;
}

export interface RequestWorkflow {
  id?: string;
  name?: string;
  description?: string;
}

export interface RequestType {
  id?: string;
  name?: string;
  description?: string;
  form_schema?: any;
}

export interface RequestRequester {
  id?: string;
  display_name?: string;
  email?: string;
}

export interface Request {
  id: string;
  title: string;
  form_data: Record<string, any>;
  status: "pending" | "approved" | "rejected" | "in_progress";
  priority: "low" | "medium" | "high";
  requester_id?: string;
  requester?: RequestRequester;
  request_type_id?: string;
  workflow_id?: string;
  current_step_id?: string;
  due_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface RequestDetails {
  request: Request;
  request_type?: RequestType;
  workflow?: RequestWorkflow;
  current_step?: RequestStep;
  requester?: RequestRequester;
  approvals?: RequestApproval[];
  attachments?: RequestAttachment[];
}

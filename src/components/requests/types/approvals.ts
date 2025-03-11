
export interface RequestApproval {
  id: string;
  request_id: string;
  step_id: string;
  status: string;
  request: {
    id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
    current_step_id: string;
    requester_id: string;
    request_type_id: string;
    request_type: {
      id: string;
      name: string;
    }[];
  }[];
  step: {
    id: string;
    step_name: string;
    step_type: string;
    approver_id: string;
  }[];
}

export interface RequestWithApproval {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  current_step_id: string;
  requester_id: string;
  request_type_id: string;
  request_type: {
    id: string;
    name: string;
  } | null;
  step_id: string | null;
  step_name?: string | null;
  step_type?: string | null;
  approval_id: string | null;
  requester: {
    id: string;
    display_name: string;
    email: string;
  } | null;
}

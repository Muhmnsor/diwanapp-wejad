
export interface EmployeeLeaveBalance {
  employee_name: string;
  employee_id: string;
  annual_balance: number;
  emergency_balance: number;
}

export interface LeaveEntitlement {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  leave_type?: {
    id: string;
    name: string;
  };
}


import React from "react";
import { useLeaveEntitlements } from "@/hooks/hr/useLeaveEntitlements";
import { useHRPermissions } from "@/hooks/hr/useHRPermissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/refactored-auth";

export function LeaveBalanceTab() {
  const { data: leaveEntitlements, isLoading, error } = useLeaveEntitlements();
  const { data: permissions } = useHRPermissions();
  const { user } = useAuthStore();

  // First check if user is admin - they should always have access
  const isAdmin = user?.isAdmin;

  // Only block access if user is not admin AND doesn't have canManageLeaves permission
  if (!isAdmin && !permissions?.canManageLeaves) {
    return (
      <div className="p-8 text-center text-red-500">
        عذراً، لا تملك صلاحية الوصول لهذه الصفحة
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        حدث خطأ في جلب بيانات الإجازات
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group entitlements by employee
  const employeeBalances = leaveEntitlements?.reduce((acc, entitlement) => {
    const employeeId = entitlement.employee_id;
    if (!acc[employeeId]) {
      acc[employeeId] = {
        employee_name: (entitlement as any).employee?.full_name || "غير معروف",
        employee_id: employeeId,
        annual_balance: 0,
        emergency_balance: 0
      };
    }

    // Update balances based on leave type
    if (entitlement.leave_type?.name === "سنوية") {
      acc[employeeId].annual_balance = entitlement.remaining_days;
    } else if (entitlement.leave_type?.name === "اضطرارية") {
      acc[employeeId].emergency_balance = entitlement.remaining_days;
    }

    return acc;
  }, {} as Record<string, { employee_name: string; employee_id: string; annual_balance: number; emergency_balance: number; }>);

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold mb-6">أرصدة إجازات الموظفين</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم الموظف</TableHead>
              <TableHead>رصيد الإجازة السنوية</TableHead>
              <TableHead>رصيد الإجازة الاضطرارية</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.values(employeeBalances || {}).map((balance) => (
              <TableRow key={balance.employee_id}>
                <TableCell className="font-medium">
                  {balance.employee_name}
                </TableCell>
                <TableCell>
                  {balance.annual_balance} يوم
                </TableCell>
                <TableCell>
                  {balance.emergency_balance} يوم
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  created_at: string;
  employee: {
    full_name: string;
  } | null;
}

const statusMap = {
  pending: { label: "قيد المراجعة", variant: "warning" },
  approved: { label: "تمت الموافقة", variant: "success" },
  rejected: { label: "مرفوض", variant: "destructive" },
};

export function LeavesTable() {
  const { user } = useAuthStore();
  const [updating, setUpdating] = useState<string | null>(null);
  const { data: leaveTypes } = useLeaveTypes();

const getLeaveTypeName = (typeId: string) => {
  if (leaveTypes) {
    const leaveType = leaveTypes.find(type => type.id === typeId);
    if (leaveType) return leaveType.name;
  }
  
  // Fallback if types not loaded yet
  const fallbackMap = {
    annual: "سنوية",
    sick: "مرضية",
    emergency: "طارئة",
    maternity: "أمومة",
    unpaid: "بدون راتب",
  };
  
  return fallbackMap[typeId] || typeId;
};

  const { data: leaves, refetch, isLoading } = useQuery({
    queryKey: ["leaves"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hr_leave_requests")
        .select(`
          *,
          employee:employee_id (full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching leaves:", error);
        throw error;
      }

      return data as LeaveRequest[];
    },
  });

  const updateLeaveStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const { error } = await supabase
        .from("hr_leave_requests")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم تحديث حالة الإجازة",
        description: status === "approved" ? "تمت الموافقة على طلب الإجازة" : "تم رفض طلب الإجازة",
      });

      refetch();
    } catch (error) {
      console.error("Error updating leave status:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تحديث حالة الإجازة",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const isAdmin = user?.isAdmin || user?.role === "admin";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!leaves || leaves.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">لا توجد طلبات إجازة</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الموظف</TableHead>
            <TableHead>نوع الإجازة</TableHead>
            <TableHead>تاريخ البداية</TableHead>
            <TableHead>تاريخ النهاية</TableHead>
            <TableHead>السبب</TableHead>
            <TableHead>الحالة</TableHead>
            {isAdmin && <TableHead>الإجراءات</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.map((leave) => (
            <TableRow key={leave.id}>
              <TableCell>{leave.employee?.full_name || "غير معروف"}</TableCell>
              <TableCell>{getLeaveTypeName(leave.leave_type)}</TableCell>
              <TableCell>
                {format(new Date(leave.start_date), "d MMMM yyyy", { locale: ar })}
              </TableCell>
              <TableCell>
                {format(new Date(leave.end_date), "d MMMM yyyy", { locale: ar })}
              </TableCell>
              <TableCell>{leave.reason || "غير محدد"}</TableCell>
              <TableCell>
                <Badge variant={statusMap[leave.status]?.variant as any || "default"}>
                  {statusMap[leave.status]?.label || leave.status}
                </Badge>
              </TableCell>
              {isAdmin && (
                <TableCell>
                  {leave.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => updateLeaveStatus(leave.id, "approved")}
                        disabled={updating === leave.id}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => updateLeaveStatus(leave.id, "rejected")}
                        disabled={updating === leave.id}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarDays, Check, X, Hourglass } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const fetchLeaveRequests = async () => {
  const { data, error } = await supabase
    .from("hr_leave_requests")
    .select(`
      *,
      employees:employee_id (
        id,
        full_name,
        position,
        department
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

const getLeaveTypeName = (type: string) => {
  const types: Record<string, string> = {
    annual: "سنوية",
    sick: "مرضية",
    emergency: "طارئة",
    maternity: "أمومة",
    unpaid: "بدون راتب",
  };
  return types[type] || type;
};

export function LeavesTable() {
  const { data: leaveRequests, isLoading, error, refetch } = useQuery({
    queryKey: ["leave-requests"],
    queryFn: fetchLeaveRequests,
  });

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateLeaveStatus = async (id: string, status: string) => {
    setUpdatingId(id);
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
      setUpdatingId(null);
    }
  };

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        حدث خطأ أثناء تحميل طلبات الإجازات
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          {Array(5)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="flex items-center space-x-4 space-x-reverse">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
        </div>
      ) : leaveRequests && leaveRequests.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الموظف</TableHead>
              <TableHead>نوع الإجازة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>المدة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRequests.map((leave: any) => {
              const startDate = new Date(leave.start_date);
              const endDate = new Date(leave.end_date);
              const dateDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              
              return (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">
                    {leave.employees?.full_name || "غير محدد"}
                  </TableCell>
                  <TableCell>{getLeaveTypeName(leave.leave_type)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(leave.start_date), "dd MMM yyyy", { locale: ar })} - {format(new Date(leave.end_date), "dd MMM yyyy", { locale: ar })}
                  </TableCell>
                  <TableCell>{dateDiff} يوم</TableCell>
                  <TableCell>
                    <LeaveStatusBadge status={leave.status} />
                  </TableCell>
                  <TableCell>
                    {leave.status === "pending" && (
                      <div className="flex space-x-2 space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-800 hover:bg-green-100"
                          onClick={() => updateLeaveStatus(leave.id, "approved")}
                          disabled={updatingId === leave.id}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          قبول
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-100"
                          onClick={() => updateLeaveStatus(leave.id, "rejected")}
                          disabled={updatingId === leave.id}
                        >
                          <X className="h-4 w-4 mr-1" />
                          رفض
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground bg-muted rounded-md">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg mb-2">لا توجد طلبات إجازات حالياً</p>
          <p className="text-sm">طلبات الإجازات التي يتم تقديمها ستظهر هنا</p>
        </div>
      )}
    </div>
  );
}

function LeaveStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
          <Check className="h-3 w-3 mr-1" />
          مقبولة
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">
          <X className="h-3 w-3 mr-1" />
          مرفوضة
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Hourglass className="h-3 w-3 mr-1" />
          قيد المراجعة
        </Badge>
      );
  }
}

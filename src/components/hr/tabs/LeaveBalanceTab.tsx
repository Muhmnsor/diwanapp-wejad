
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaveEntitlements } from "@/hooks/hr/useLeaveEntitlements";
import { Calendar, BadgeCheck, Clock } from "lucide-react";
import { useAuthStore } from "@/store/refactored-auth";

export function LeaveBalanceTab() {
  const { user } = useAuthStore();
  const { data: leaveEntitlements, isLoading, error } = useLeaveEntitlements();

  if (!user) {
    return <div className="p-8 text-center text-red-500">يجب تسجيل الدخول لعرض رصيد الإجازات</div>;
  }

  if (error) {
    console.error("Leave entitlements error:", error);
    return <div className="p-8 text-center text-red-500">حدث خطأ في جلب بيانات الإجازات</div>;
  }

  if (isLoading) {
    return <div className="p-8 text-center">جاري تحميل رصيد الإجازات...</div>;
  }

  if (!leaveEntitlements?.length) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        لم يتم العثور على رصيد إجازات لهذه السنة
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {leaveEntitlements.map((entitlement) => (
        <Card key={entitlement.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {entitlement.leave_type?.name}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">الرصيد الكلي:</span>
                </div>
                <div className="text-lg font-bold">{entitlement.total_days} يوم</div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">المستخدم:</span>
                </div>
                <div className="text-lg font-bold">{entitlement.used_days} يوم</div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">المتبقي:</span>
                </div>
                <div className="text-lg font-bold">{entitlement.remaining_days} يوم</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

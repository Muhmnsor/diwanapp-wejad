
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/refactored-auth";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function LeaveSystemTester() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const testCreateLeaveEntitlement = async () => {
    setIsLoading(true);
    try {
      // أولاً نحصل على معرف الموظف
      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (employeeError) throw employeeError;

      // نحصل على معرف نوع الإجازة السنوية
      const { data: leaveTypeData, error: leaveTypeError } = await supabase
        .from("hr_leave_types")
        .select("id")
        .eq("name", "سنوية")
        .single();

      if (leaveTypeError) throw leaveTypeError;

      // نقوم بإنشاء رصيد إجازة جديد
      const { error: entitlementError } = await supabase
        .from("hr_leave_entitlements")
        .insert({
          employee_id: employeeData.id,
          leave_type_id: leaveTypeData.id,
          year: new Date().getFullYear(),
          total_days: 30,
          used_days: 0,
          remaining_days: 30
        });

      if (entitlementError) throw entitlementError;

      toast({
        title: "تم إنشاء رصيد الإجازات بنجاح",
        description: "تم إضافة 30 يوم إجازة سنوية",
        variant: "default",
      });
    } catch (error) {
      console.error("Error testing leave system:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إنشاء رصيد الإجازات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testLeaveRequest = async () => {
    setIsLoading(true);
    try {
      // نحصل على معرف الموظف
      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (employeeError) throw employeeError;

      // إنشاء طلب إجازة جديد
      const { error: requestError } = await supabase
        .from("hr_leave_requests")
        .insert({
          employee_id: employeeData.id,
          leave_type: "annual", // نوع الإجازة السنوية
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          reason: "اختبار نظام الإجازات",
          status: "pending"
        });

      if (requestError) throw requestError;

      toast({
        title: "تم إنشاء طلب الإجازة بنجاح",
        description: "يمكنك متابعة حالة الطلب في قائمة الإجازات",
        variant: "default",
      });
    } catch (error) {
      console.error("Error creating leave request:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إنشاء طلب الإجازة",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>اختبار نظام الإجازات</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <Button 
            onClick={testCreateLeaveEntitlement}
            disabled={isLoading}
          >
            اختبار إنشاء رصيد إجازة
          </Button>
          
          <Button 
            onClick={testLeaveRequest}
            disabled={isLoading}
          >
            اختبار إنشاء طلب إجازة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

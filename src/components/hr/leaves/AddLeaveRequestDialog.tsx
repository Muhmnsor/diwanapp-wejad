
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";
import { useLeaveEntitlements } from "@/hooks/hr/useLeaveEntitlements";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { DatePicker } from "@/components/ui/date-picker";

interface AddLeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeaveRequestDialog({ open, onOpenChange }: AddLeaveRequestDialogProps) {
  const { data: leaveTypes, isLoading: isLoadingLeaveTypes } = useLeaveTypes();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const { data: leaveEntitlements, isLoading: isLoadingEntitlements } = useLeaveEntitlements(employeeId || undefined);

  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: new Date(),
    end_date: new Date(),
    reason: "",
    status: "pending",
  });

  // Get current user and fetch their employee record
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          const { data: employee } = await supabase
            .from("employees")
            .select("*")
            .eq("email", profile.email)
            .single();

          if (employee) {
            setEmployeeId(employee.id);
            setGender(employee.gender);
            console.log("Found employee:", employee.id, "with gender:", employee.gender);
          } else {
            console.log("No employee record found for this user");
          }
        }
      }
    };

    if (open) {
      getCurrentUser();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Submitting leave request with data:", formData);
      console.log("Employee ID:", employeeId);
      console.log("Gender:", gender);

      // Validate that all required fields are filled
      if (!formData.leave_type || !formData.start_date || !formData.end_date || !formData.reason) {
        toast.error("يرجى ملء جميع الحقول المطلوبة");
        setIsSubmitting(false);
        return;
      }

      if (!employeeId) {
        toast.error("لم يتم العثور على بيانات الموظف");
        setIsSubmitting(false);
        return;
      }

      // Calculate days between start and end dates
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (days <= 0) {
        toast.error("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
        setIsSubmitting(false);
        return;
      }

      // Check for leave entitlement
      const entitlement = leaveEntitlements?.find(e => e.leave_type?.code === formData.leave_type);
      
      if (!entitlement) {
        toast.error("لم يتم العثور على رصيد إجازة لهذا النوع");
        setIsSubmitting(false);
        return;
      }

      if (entitlement.remaining_days < days) {
        toast.error(`رصيد الإجازة غير كافي. الرصيد المتبقي: ${entitlement.remaining_days} يوم`);
        setIsSubmitting(false);
        return;
      }

      // Get the leave type details to check eligibility
      const selectedLeaveType = leaveTypes?.find(lt => lt.code === formData.leave_type);
      
      if (selectedLeaveType && selectedLeaveType.gender_eligibility && 
          selectedLeaveType.gender_eligibility !== 'both' && 
          selectedLeaveType.gender_eligibility !== gender) {
        toast.error(`هذا النوع من الإجازات غير متاح لك`);
        setIsSubmitting(false);
        return;
      }

      // Insert the leave request
      const { data, error } = await supabase
        .from("hr_leave_requests")
        .insert({
          employee_id: employeeId,
          leave_type: formData.leave_type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          days_count: days,
          reason: formData.reason,
          status: formData.status
        })
        .select();

      if (error) {
        console.error("Error submitting leave request:", error);
        toast.error("حدث خطأ أثناء تقديم طلب الإجازة");
        return;
      }

      console.log("Leave request submitted successfully:", data);
      toast.success("تم تقديم طلب الإجازة بنجاح");
      onOpenChange(false);
      
      // Reset form
      setFormData({
        leave_type: "",
        start_date: new Date(),
        end_date: new Date(),
        reason: "",
        status: "pending",
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("حدث خطأ أثناء تقديم طلب الإجازة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLeaveTypes = leaveTypes?.filter(type => {
    if (!gender || !type.gender_eligibility || type.gender_eligibility === 'both') {
      return true;
    }
    return type.gender_eligibility === gender;
  });

  const getLeaveBalance = (leaveTypeCode: string) => {
    const entitlement = leaveEntitlements?.find(e => e.leave_type?.code === leaveTypeCode);
    return entitlement ? entitlement.remaining_days : 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>طلب إجازة جديدة</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="leave_type">نوع الإجازة</Label>
            <Select
              value={formData.leave_type}
              onValueChange={(value) => setFormData({ ...formData, leave_type: value })}
            >
              <SelectTrigger id="leave_type" className="w-full">
                <SelectValue placeholder="اختر نوع الإجازة" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingLeaveTypes ? (
                  <div className="flex justify-center p-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  filteredLeaveTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.code}>
                      {type.name} (الرصيد: {getLeaveBalance(type.code)})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">تاريخ البداية</Label>
              <DatePicker
                date={formData.start_date}
                setDate={(date) => date && setFormData({ ...formData, start_date: date })}
                placeholder="اختر تاريخ البداية"
                locale="ar"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">تاريخ النهاية</Label>
              <DatePicker
                date={formData.end_date}
                setDate={(date) => date && setFormData({ ...formData, end_date: date })}
                placeholder="اختر تاريخ النهاية"
                locale="ar"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">سبب الإجازة</Label>
            <Textarea
              id="reason"
              placeholder="أدخل سبب طلب الإجازة"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || isLoadingEntitlements}>
            {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            تقديم طلب الإجازة
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

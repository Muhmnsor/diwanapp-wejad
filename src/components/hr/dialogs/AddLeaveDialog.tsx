
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";
import { CalendarIcon, Plus } from "lucide-react";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export function AddLeaveDialog() {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<string>("");
  const [selectedEmployeeGender, setSelectedEmployeeGender] = useState<string | undefined>();
  const [leaveType, setLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: employees } = useEmployees();
  const { data: leaveTypes, isLoading: isLoadingLeaveTypes } = useLeaveTypes(selectedEmployeeGender);

  // Update selected employee's gender when employeeId changes
  useEffect(() => {
    if (employeeId && employees) {
      const selectedEmployee = employees.find(emp => emp.id === employeeId);
      setSelectedEmployeeGender(selectedEmployee?.gender);
      
      // Reset leave type when employee changes (in case previous selection is not valid for new gender)
      setLeaveType("");
    }
  }, [employeeId, employees]);

  const handleSubmit = async () => {
    if (!employeeId || !leaveType || !startDate || !endDate) {
      toast.error("الرجاء إكمال جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("hr_leave_requests")
        .insert({
          employee_id: employeeId,
          leave_type: leaveType,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          reason: reason || null,
          status: "pending",
        });

      if (error) throw error;

      toast.success("تم إرسال طلب الإجازة بنجاح");
      
      // Reset form
      setEmployeeId("");
      setLeaveType("");
      setStartDate(undefined);
      setEndDate(undefined);
      setReason("");
      setSelectedEmployeeGender(undefined);
      
      setOpen(false);
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast.error("حدث خطأ أثناء إرسال طلب الإجازة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Plus className="h-4 w-4" />
          طلب إجازة جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>طلب إجازة جديدة</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employee">الموظف</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger id="employee">
                <SelectValue placeholder="اختر الموظف" />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="leaveType">نوع الإجازة</Label>
            <Select 
              value={leaveType} 
              onValueChange={setLeaveType}
              disabled={!employeeId || isLoadingLeaveTypes}
            >
              <SelectTrigger id="leaveType">
                <SelectValue placeholder={isLoadingLeaveTypes ? "جاري التحميل..." : "اختر نوع الإجازة"} />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.code}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDate">تاريخ البداية</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-right",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP", { locale: ar }) : "اختر التاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">تاريخ النهاية</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-right",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP", { locale: ar }) : "اختر التاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => (startDate ? date < startDate : false)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">سبب الإجازة (اختياري)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="أدخل سبب الإجازة"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline" disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

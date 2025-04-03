
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format, differenceInDays, addDays } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";
import { useLeaveEntitlements } from "@/hooks/hr/useLeaveEntitlements";
import { Loader2 } from "lucide-react";

interface AddLeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeaveRequestDialog({ open, onOpenChange }: AddLeaveRequestDialogProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm();
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>();
  const [selectedEmployeeGender, setSelectedEmployeeGender] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [leaveDuration, setLeaveDuration] = useState<number>(0);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string | undefined>();

  // Fetch employees and leave types
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees();
  const { data: leaveTypes, isLoading: isLoadingLeaveTypes } = useLeaveTypes();
  const { data: leaveEntitlements, isLoading: isLoadingEntitlements } = useLeaveEntitlements(selectedEmployeeId);

  // Filter leave types based on employee gender
  const filteredLeaveTypes = leaveTypes?.filter(leaveType => {
    if (!selectedEmployeeGender) return true;
    return leaveType.gender_eligibility === 'both' || leaveType.gender_eligibility === selectedEmployeeGender;
  });

  // Find matching entitlement
  const findEntitlement = (leaveTypeId: string) => {
    if (!leaveEntitlements) return null;
    return leaveEntitlements.find(entitlement => entitlement.leave_type_id === leaveTypeId);
  };

  // Calculate leave duration when dates change
  useEffect(() => {
    if (startDate && endDate) {
      // Add 1 to include both start and end days
      const days = differenceInDays(endDate, startDate) + 1;
      setLeaveDuration(days > 0 ? days : 0);
      setValue('duration', days > 0 ? days : 0);
    } else {
      setLeaveDuration(0);
      setValue('duration', 0);
    }
  }, [startDate, endDate, setValue]);

  // Handle employee change
  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setSelectedLeaveType(undefined);
    
    // Find the employee to get gender
    const employee = employees?.find(emp => emp.id === employeeId);
    setSelectedEmployeeGender(employee?.gender);
  };

  // Handle form submission
  const onSubmit = async (data: any) => {
    try {
      if (!startDate || !endDate || !selectedEmployeeId || !selectedLeaveType) {
        toast({
          title: "معلومات ناقصة",
          description: "الرجاء إدخال جميع البيانات المطلوبة",
          variant: "destructive",
        });
        return;
      }

      // Format dates for database
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      const { error } = await supabase
        .from("hr_leave_requests")
        .insert({
          employee_id: selectedEmployeeId,
          leave_type: selectedLeaveType,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          reason: data.reason || null
        });

      if (error) {
        console.error("Error submitting leave request:", error);
        throw error;
      }

      toast({
        title: "تم تقديم الطلب بنجاح",
        description: "تم إرسال طلب الإجازة بنجاح"
      });

      // Reset form and close dialog
      reset();
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedEmployeeId(undefined);
      setSelectedLeaveType(undefined);
      setLeaveDuration(0);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast({
        title: "حدث خطأ أثناء تقديم طلب الإجازة",
        description: "الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    reset();
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedEmployeeId(undefined);
    setSelectedLeaveType(undefined);
    setLeaveDuration(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>طلب إجازة جديد</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee">الموظف</Label>
            <Select 
              onValueChange={handleEmployeeChange}
              value={selectedEmployeeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الموظف" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingEmployees ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="mr-2">جاري التحميل...</span>
                  </div>
                ) : (
                  employees?.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Leave Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="leaveType">نوع الإجازة</Label>
            <Select 
              onValueChange={(value) => setSelectedLeaveType(value)}
              value={selectedLeaveType}
              disabled={!selectedEmployeeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الإجازة" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingLeaveTypes ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="mr-2">جاري التحميل...</span>
                  </div>
                ) : (
                  filteredLeaveTypes?.map((leaveType) => {
                    const entitlement = findEntitlement(leaveType.id);
                    return (
                      <SelectItem key={leaveType.id} value={leaveType.code}>
                        {leaveType.name} 
                        {entitlement && ` (الرصيد: ${entitlement.remaining_days})`}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
            {selectedLeaveType && isLoadingEntitlements && (
              <div className="text-xs text-muted-foreground flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                جاري تحميل الرصيد...
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">تاريخ البداية</Label>
              <DatePicker
                date={startDate}
                setDate={(date) => {
                  setStartDate(date);
                  if (date && (!endDate || date > endDate)) {
                    setEndDate(date);
                  }
                }}
                placeholder="اختر تاريخ البداية"
                locale="ar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">تاريخ النهاية</Label>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                placeholder="اختر تاريخ النهاية"
                locale="ar"
              />
            </div>
          </div>

          {/* Duration Display */}
          {leaveDuration > 0 && (
            <div className="text-sm py-1 px-2 bg-muted rounded-md">
              مدة الإجازة: <span className="font-bold">{leaveDuration}</span> {leaveDuration === 1 ? 'يوم' : 'أيام'}
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">سبب الإجازة</Label>
            <Textarea
              id="reason"
              placeholder="أدخل سبب الإجازة (اختياري)"
              {...register("reason")}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">إلغاء</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تقديم الطلب
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

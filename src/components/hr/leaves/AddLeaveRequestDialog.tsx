// AddLeaveRequestDialog.tsx
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { useLeaveEntitlements } from "@/hooks/hr/useLeaveEntitlements";

// Utility function to calculate days between dates
function getDaysBetweenDates(startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // Add 1 to include both start and end dates
  return Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay)) + 1;
}

// Utility function to map gender values
function mapGenderToEligibility(gender: string): string {
  if (gender === "ذكر") return "male";
  if (gender === "أنثى") return "female";
  return "both";
}

// Form schema for validation
const leaveFormSchema = z.object({
  employee_id: z.string({
    required_error: "يجب اختيار الموظف",
  }),
  leave_type: z.string({
    required_error: "يجب اختيار نوع الإجازة",
  }),
  start_date: z.date({
    required_error: "يجب اختيار تاريخ البداية",
  }),
  end_date: z.date({
    required_error: "يجب اختيار تاريخ النهاية",
  }).refine(
    (date) => date >= new Date(new Date().setHours(0, 0, 0, 0)),
    {
      message: "تاريخ النهاية يجب أن يكون اليوم أو بعده",
    }
  ),
  reason: z.string().optional(),
  status: z.string().default("pending"),
})
.refine(
  (data) => data.end_date >= data.start_date,
  {
    message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
    path: ["end_date"],
  }
);

interface AddLeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeaveRequestDialog({ open, onOpenChange }: AddLeaveRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [daysCount, setDaysCount] = useState<number | null>(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string | null>(null);
  
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees();
  const { data: leaveTypes, isLoading: isLoadingLeaveTypes } = useLeaveTypes();
  const { data: leaveEntitlements, isLoading: isLoadingEntitlements } = useLeaveEntitlements(selectedEmployee?.id);
  
  const form = useForm<z.infer<typeof leaveFormSchema>>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      employee_id: "",
      leave_type: "",
      status: "pending",
      reason: ""
    }
  });
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedEmployee(null);
      setSelectedLeaveType(null);
      setDaysCount(null);
    }
  }, [open, form]);
  
  // Update days count when dates change
  useEffect(() => {
    const startDate = form.watch("start_date");
    const endDate = form.watch("end_date");
    
    if (startDate && endDate) {
      setDaysCount(getDaysBetweenDates(startDate, endDate));
    } else {
      setDaysCount(null);
    }
  }, [form.watch("start_date"), form.watch("end_date")]);
  
  // Get filtered leave types based on employee gender
  const filteredLeaveTypes = leaveTypes?.filter(type => {
    if (!selectedEmployee) return true;
    const employeeGender = mapGenderToEligibility(selectedEmployee.gender);
    return type.gender_eligibility === "both" || type.gender_eligibility === employeeGender;
  });
  
  // Find leave entitlement for selected leave type
  const selectedEntitlement = leaveEntitlements?.find(
    entitlement => entitlement.leave_type_id === selectedLeaveType
  );
  
  // Find leave type object by ID
  const selectedLeaveTypeObject = leaveTypes?.find(
    type => type.id === selectedLeaveType
  );
  
  // Handle employee selection
  const handleEmployeeChange = (employeeId: string) => {
    form.setValue("employee_id", employeeId);
    const employee = employees?.find(emp => emp.id === employeeId);
    setSelectedEmployee(employee);
    
    // Reset leave type when employee changes
    form.setValue("leave_type", "");
    setSelectedLeaveType(null);
  };
  
  // Handle leave type selection
  const handleLeaveTypeChange = (leaveTypeId: string) => {
    form.setValue("leave_type", leaveTypeId);
    setSelectedLeaveType(leaveTypeId);
  };
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof leaveFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Format dates for Supabase
      const formattedData = {
        employee_id: data.employee_id,
        leave_type: data.leave_type, // This should be the ID of the leave type
        start_date: data.start_date.toISOString().split('T')[0],
        end_date: data.end_date.toISOString().split('T')[0],
        reason: data.reason,
        status: data.status
      };
      
      console.log("Submitting leave request:", formattedData);
      
      const { data: result, error } = await supabase
        .from("hr_leave_requests")
        .insert(formattedData)
        .select()
        .single();
      
      if (error) {
        console.error("Error submitting leave request:", error);
        throw error;
      }
      
      toast({
        title: "تم تقديم طلب الإجازة بنجاح",
        description: "تم إضافة طلب الإجازة وبانتظار الموافقة عليه"
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast({
        title: "حدث خطأ أثناء تقديم طلب الإجازة",
        description: "يرجى التحقق من المعلومات والمحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>إضافة طلب إجازة جديد</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Employee Selection */}
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموظف</FormLabel>
                  <Select
                    onValueChange={handleEmployeeChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingEmployees ? (
                        <div className="flex justify-center items-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : employees && employees.length > 0 ? (
                        employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.full_name} 
                            {employee.gender && (
                              <span className="mr-2 text-sm text-muted-foreground">
                                ({employee.gender})
                              </span>
                            )}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          لا يوجد موظفين
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedEmployee && (
              <>
                {/* Leave Type Selection */}
                <FormField
                  control={form.control}
                  name="leave_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الإجازة</FormLabel>
                      <Select
                        onValueChange={handleLeaveTypeChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الإجازة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingLeaveTypes ? (
                            <div className="flex justify-center items-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : filteredLeaveTypes && filteredLeaveTypes.length > 0 ? (
                            filteredLeaveTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              لا توجد أنواع إجازات متاحة
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        اختر نوع الإجازة المناسب للموظف
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Leave Balance Information */}
                {selectedLeaveTypeObject && (
                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">نوع الإجازة:</span>
                          <Badge variant="outline" className="font-normal">
                            {selectedLeaveTypeObject.name}
                          </Badge>
                        </div>
                        {isLoadingEntitlements ? (
                          <div className="flex justify-center items-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : selectedEntitlement ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">الرصيد السنوي:</span>
                              <Badge variant="outline" className="font-normal">
                                {selectedEntitlement.entitled_days} يوم
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">الرصيد المستخدم:</span>
                              <Badge variant="outline" className="font-normal">
                                {selectedEntitlement.used_days} يوم
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">الرصيد المتبقي:</span>
                              <Badge variant={selectedEntitlement.remaining_days > 0 ? "success" : "destructive"} className="font-normal">
                                {selectedEntitlement.remaining_days} يوم
                              </Badge>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-yellow-600">
                            لا يوجد رصيد محدد لهذا النوع من الإجازات
                          </div>
                        )}
                        {daysCount && (
                          <div className="flex justify-between items-center mt-2 pt-2 border-t">
                            <span className="text-sm">مدة الإجازة المطلوبة:</span>
                            <Badge variant={
                              selectedEntitlement && daysCount > selectedEntitlement.remaining_days
                                ? "destructive"
                                : "default"
                            } className="font-normal">
                              {daysCount} يوم
                            </Badge>
                          </div>
                        )}
                        {selectedEntitlement && daysCount && daysCount > selectedEntitlement.remaining_days && (
                          <div className="text-sm text-destructive">
                            تجاوز الرصيد المتاح!
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Date Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>تاريخ البداية</FormLabel>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                          placeholder="اختر تاريخ البداية"
                          locale="ar"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>تاريخ النهاية</FormLabel>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                          placeholder="اختر تاريخ النهاية"
                          locale="ar"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Reason Field */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سبب الإجازة (اختياري)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أدخل سبب طلب الإجازة"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || 
                  (!selectedEmployee) || 
                  (!selectedLeaveType) || 
                  (selectedEntitlement && daysCount && daysCount > selectedEntitlement.remaining_days)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التقديم...
                  </>
                ) : "تقديم طلب الإجازة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

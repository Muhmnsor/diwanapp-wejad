
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid'; 
import { LeaveBalanceDisplay } from "./LeaveBalanceDisplay";
import { useLeaveBalance } from "@/hooks/hr/useLeaveBalance";
import { getOrCreateEntitlement } from "@/services/leaveEntitlementService";

interface AddLeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeaveRequestDialog({ open, onOpenChange }: AddLeaveRequestDialogProps) {
  const { user } = useAuthStore();
  const { data: employees, isLoading: isEmployeesLoading } = useEmployees();
  const { data: leaveTypes } = useLeaveTypes();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("");
  
  const form = useForm({
    defaultValues: {
      employee_id: "",
      leave_type: "",
      start_date: "",
      end_date: "",
      reason: ""
    },
  });
  
  // Get values from form to check balance
  const startDate = form.watch("start_date");
  const endDate = form.watch("end_date");
  const { calculateLeaveDays, checkLeaveBalance } = useLeaveBalance(selectedEmployee, selectedLeaveType);
  
  const handleEmployeeChange = (value: string) => {
    setSelectedEmployee(value);
    form.setValue("employee_id", value);
  };
  
  const handleLeaveTypeChange = (value: string) => {
    setSelectedLeaveType(value);
    form.setValue("leave_type", value);
  };
  
  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      // Check if user has sufficient balance
      if (selectedEmployee && selectedLeaveType && values.start_date && values.end_date) {
        const leaveTypeObj = leaveTypes?.find(lt => lt.id === values.leave_type);
        if (leaveTypeObj) {
          const balanceCheck = await checkLeaveBalance(
            values.employee_id, 
            values.leave_type, 
            values.start_date, 
            values.end_date
          );
          
          if (!balanceCheck.hasBalance) {
            toast({
              title: "رصيد الإجازة غير كافي",
              description: `الرصيد المتاح: ${balanceCheck.available} يوم، المطلوب: ${balanceCheck.required} يوم`,
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
          
          // Ensure entitlement exists
          await getOrCreateEntitlement(values.employee_id, values.leave_type);
        }
      }
      
      // Insert the leave request
      const { error } = await supabase
        .from("hr_leave_requests")
        .insert({
          ...values,
        });

      if (error) throw error;
      
      toast({
        title: "تم تقديم طلب الإجازة",
        description: "تم تقديم طلب الإجازة بنجاح وسيتم مراجعته"
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تقديم طلب الإجازة",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تقديم طلب إجازة</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="employee_id"
              rules={{ required: "الرجاء اختيار موظف" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموظف</FormLabel>
                  <Select 
                    onValueChange={(value) => handleEmployeeChange(value)} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees?.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="leave_type"
              rules={{ required: "الرجاء اختيار نوع الإجازة" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الإجازة</FormLabel>
                  <Select 
                    onValueChange={(value) => handleLeaveTypeChange(value)} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الإجازة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes?.map((leaveType) => (
                        <SelectItem key={leaveType.id} value={leaveType.id}>
                          {leaveType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                rules={{ required: "الرجاء تحديد تاريخ البداية" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ البداية</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_date"
                rules={{ required: "الرجاء تحديد تاريخ النهاية" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ النهاية</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {selectedEmployee && selectedLeaveType && startDate && endDate && (
              <LeaveBalanceDisplay
                employeeId={selectedEmployee}
                leaveTypeId={selectedLeaveType}
                startDate={startDate}
                endDate={endDate}
              />
            )}
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السبب (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="سبب طلب الإجازة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري التقديم..." : "تقديم الطلب"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, addDays, isBefore } from "date-fns";
import { cn } from "@/lib/utils";
import { useLeaveBalance } from "@/hooks/hr/useLeaveBalance";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { useHRPermissions } from "@/hooks/hr/useHRPermissions";
import { useAuthStore } from "@/store/refactored-auth";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface AddLeaveDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface LeaveFormValues {
  employee_id: string;
  leave_type: string;
  start_date: Date;
  end_date: Date;
  reason: string;
}

export default function AddLeaveDialog({
  open,
  onClose,
  onSuccess,
}: AddLeaveDialogProps) {
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees();
  const { data: permissions } = useHRPermissions();
  const { user } = useAuthStore();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string | null>(null);
  const [employeeIdFromUser, setEmployeeIdFromUser] = useState<string | null>(null);

  // Find current user's employee ID if they are an employee
  useEffect(() => {
    if (user && employees) {
      const userEmployee = employees.find(emp => emp.user_id === user.id);
      if (userEmployee) {
        setEmployeeIdFromUser(userEmployee.id);
        setSelectedEmployee(userEmployee.id);
      }
    }
  }, [user, employees]);

  // Get leave types and leave balance
  const { data: leaveTypes = [], isLoading: isLoadingLeaveTypes } = useLeaveTypes();
  const { data: leaveBalance = {}, isLoading: isLoadingBalance } = useLeaveBalance(selectedEmployee || undefined);

  const canManageOtherLeaves = permissions?.canManageLeaves || false;
  const showEmployeeSelection = canManageOtherLeaves;

  const form = useForm<LeaveFormValues>({
    defaultValues: {
      employee_id: "",
      leave_type: "",
      start_date: new Date(),
      end_date: addDays(new Date(), 1),
      reason: "",
    },
  });

  useEffect(() => {
    if (selectedEmployee) {
      form.setValue("employee_id", selectedEmployee);
    }
  }, [selectedEmployee, form]);

  // Update query client after leave request submission
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (values: LeaveFormValues) => {
      if (!values.employee_id) {
        throw new Error("Employee ID is required");
      }

      const leaveRequest = {
        employee_id: values.employee_id,
        leave_type: values.leave_type,
        start_date: format(values.start_date, 'yyyy-MM-dd'),
        end_date: format(values.end_date, 'yyyy-MM-dd'),
        reason: values.reason,
        status: "pending",
      };

      const { data, error } = await supabase
        .from("hr_leave_requests")
        .insert([leaveRequest])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تم تقديم طلب الإجازة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-stats"] });
      form.reset();
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("Error submitting leave request:", error);
      toast.error("حدث خطأ أثناء تقديم طلب الإجازة");
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    mutation.mutate(values);
  });

  const selectedLeaveBalance = selectedLeaveType ? leaveBalance[selectedLeaveType] : null;
  const isBalanceExceeded = selectedLeaveBalance && calculateDays() > selectedLeaveBalance.remainingDays;
  
  function calculateDays() {
    const startDate = form.watch("start_date");
    const endDate = form.watch("end_date");
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Calculate the difference in days
      const diffTime = end.getTime() - start.getTime();
      return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    }
    
    return 0;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-auto max-h-screen">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">إضافة طلب إجازة</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 px-6">
            {showEmployeeSelection && (
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الموظف</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedEmployee(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الموظف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingEmployees ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>جاري تحميل الموظفين...</span>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="leave_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الإجازة</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedLeaveType(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الإجازة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingLeaveTypes ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>جاري تحميل أنواع الإجازات...</span>
                        </div>
                      ) : (
                        leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {selectedLeaveType && !isLoadingBalance && (
                    <FormDescription>
                      رصيد الإجازة المتبقي: {selectedLeaveBalance?.remainingDays || 0} يوم
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>تاريخ البداية</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "yyyy-MM-dd")
                            ) : (
                              <span>اختر تاريخ</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "yyyy-MM-dd")
                            ) : (
                              <span>اختر تاريخ</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            date < new Date("1900-01-01") || 
                            (form.watch("start_date") && isBefore(date, form.watch("start_date")))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {calculateDays() > 0 && (
              <div className="text-sm">
                عدد أيام الإجازة: {calculateDays()} يوم
              </div>
            )}

            {isBalanceExceeded && (
              <Alert variant="destructive">
                <AlertTitle>تجاوز رصيد الإجازة</AlertTitle>
                <AlertDescription>
                  عدد أيام الإجازة المطلوبة ({calculateDays()} يوم) يتجاوز الرصيد المتبقي ({selectedLeaveBalance?.remainingDays} يوم)
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الإجازة</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل سبب الإجازة"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="py-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={onClose}
                className="mt-2"
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                className="mt-2" 
                disabled={
                  mutation.isPending || 
                  isBalanceExceeded || 
                  isLoadingBalance || 
                  !form.watch("leave_type") || 
                  !form.watch("employee_id")
                }
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري التقديم...
                  </>
                ) : (
                  "تقديم الطلب"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, differenceInCalendarDays } from "date-fns";
import { ar } from "date-fns/locale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { supabase } from "@/integrations/supabase/client";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { useLeaveTypes, LeaveType } from "@/hooks/hr/useLeaveTypes";
import { useLeaveEntitlements } from "@/hooks/hr/useLeaveEntitlements";

const leaveRequestSchema = z.object({
  employee_id: z.string({ required_error: "الرجاء اختيار الموظف" }),
  leave_type_id: z.string({ required_error: "الرجاء اختيار نوع الإجازة" }),
  start_date: z.date({ required_error: "الرجاء اختيار تاريخ البداية" }),
  end_date: z.date({ required_error: "الرجاء اختيار تاريخ النهاية" }),
  reason: z.string().optional(),
});

type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;

interface AddLeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeaveRequestDialog({
  open,
  onOpenChange,
}: AddLeaveRequestDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedEmployeeGender, setSelectedEmployeeGender] = useState<string | null>(null);
  const [filteredLeaveTypes, setFilteredLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveDuration, setLeaveDuration] = useState<number>(0);
  
  const queryClient = useQueryClient();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: leaveTypes = [], isLoading: isLoadingLeaveTypes } = useLeaveTypes();
  const { data: entitlements = [], isLoading: isLoadingEntitlements } = useLeaveEntitlements(selectedEmployeeId || undefined);

  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      reason: "",
    },
  });

  const { watch, setValue, reset } = form;
  const startDate = watch("start_date");
  const endDate = watch("end_date");
  const leaveTypeId = watch("leave_type_id");

  // Get employee details when employee is selected
  useEffect(() => {
    const employeeId = form.watch("employee_id");
    if (employeeId) {
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        setSelectedEmployeeId(employee.id);
        setSelectedEmployeeGender(employee.gender || "male");
      }
    } else {
      setSelectedEmployeeId(null);
      setSelectedEmployeeGender(null);
    }
  }, [form.watch("employee_id"), employees]);

  // Filter leave types based on employee gender
  useEffect(() => {
    if (selectedEmployeeGender && leaveTypes.length > 0) {
      const filtered = leaveTypes.filter(leaveType => 
        !leaveType.gender_eligibility || 
        leaveType.gender_eligibility === 'both' || 
        leaveType.gender_eligibility === selectedEmployeeGender
      );
      setFilteredLeaveTypes(filtered);
    } else {
      setFilteredLeaveTypes(leaveTypes);
    }
  }, [selectedEmployeeGender, leaveTypes]);

  // Calculate leave duration
  useEffect(() => {
    if (startDate && endDate) {
      const days = differenceInCalendarDays(endDate, startDate) + 1;
      setLeaveDuration(days > 0 ? days : 0);
    } else {
      setLeaveDuration(0);
    }
  }, [startDate, endDate]);

  // Handle end date auto-fill
  useEffect(() => {
    if (startDate && !endDate) {
      setValue("end_date", startDate);
    }
  }, [startDate, endDate, setValue]);

  const createLeaveMutation = useMutation({
    mutationFn: async (values: LeaveRequestFormValues) => {
      const { data, error } = await supabase
        .from("hr_leave_requests")
        .insert([
          {
            employee_id: values.employee_id,
            leave_type_id: values.leave_type_id,
            start_date: format(values.start_date, "yyyy-MM-dd"),
            end_date: format(values.end_date, "yyyy-MM-dd"),
            reason: values.reason,
            status: "pending",
            days_count: leaveDuration,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "تم تقديم طلب الإجازة",
        description: "تم تقديم طلب الإجازة بنجاح وسيتم مراجعته في أقرب وقت",
      });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error creating leave request:", error);
      toast({
        title: "خطأ في تقديم الطلب",
        description: "حدث خطأ أثناء تقديم طلب الإجازة",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: LeaveRequestFormValues) {
    createLeaveMutation.mutate(values);
  }

  // Find selected leave type
  const selectedLeaveType = leaveTypeId 
    ? leaveTypes.find(type => type.id === leaveTypeId) 
    : null;

  // Find entitlement for selected leave type
  const selectedEntitlement = leaveTypeId && entitlements.length > 0
    ? entitlements.find(ent => ent.leave_type_id === leaveTypeId)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تقديم طلب إجازة</DialogTitle>
          <DialogDescription>
            قم بتعبئة نموذج طلب الإجازة للموظف
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Employee Selector */}
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموظف</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingEmployees}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
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

            {/* Leave Type Selector */}
            <FormField
              control={form.control}
              name="leave_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الإجازة</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingLeaveTypes || !selectedEmployeeId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الإجازة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredLeaveTypes.map((leaveType) => (
                        <SelectItem key={leaveType.id} value={leaveType.id}>
                          {leaveType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedEntitlement && (
                    <FormDescription>
                      الرصيد المتبقي: {selectedEntitlement.remaining_days} يوم
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
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
                          className={`w-full pl-3 text-right font-normal ${
                            !field.value ? "text-muted-foreground" : ""
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: ar })
                          ) : (
                            <span>اختر التاريخ</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date */}
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
                          className={`w-full pl-3 text-right font-normal ${
                            !field.value ? "text-muted-foreground" : ""
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: ar })
                          ) : (
                            <span>اختر التاريخ</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => 
                          !startDate || date < startDate
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {leaveDuration > 0 && (
                    <FormDescription>
                      مدة الإجازة: {leaveDuration} يوم
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الإجازة (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل سبب الإجازة"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={createLeaveMutation.isPending}
              >
                إلغاء
              </Button>
              <Button 
                type="submit"
                disabled={createLeaveMutation.isPending}
              >
                {createLeaveMutation.isPending ? "جاري التقديم..." : "تقديم الطلب"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

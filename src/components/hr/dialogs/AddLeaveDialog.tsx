import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";

// Define form fields interface
interface LeaveFormValues {
  employeeId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}

export function AddLeaveDialog() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<LeaveFormValues>();
  const queryClient = useQueryClient();
  const { data: leaveTypes } = useLeaveTypes();
  const [selectedEmployeeGender, setSelectedEmployeeGender] = useState<string | null>(null);
  
  // Track selected employee ID to fetch their gender
  const selectedEmployeeId = watch("employeeId");
  
  // Fetch employees from the database
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, full_name, gender")
        .eq("status", "active")
        .order("full_name");

      if (error) throw error;
      return data;
    },
  });

  // Update selected employee gender when employee changes
  useEffect(() => {
    if (selectedEmployeeId && employees) {
      const employee = employees.find(emp => emp.id === selectedEmployeeId);
      if (employee) {
        setSelectedEmployeeGender(employee.gender || null);
      }
    }
  }, [selectedEmployeeId, employees]);

  // Filter leave types based on employee gender
  const filteredLeaveTypes = leaveTypes?.filter(type => {
    // If no gender is selected or type has no eligible_gender constraint, show it
    if (!selectedEmployeeGender || !type.eligible_gender || type.eligible_gender === 'both') {
      return true;
    }
    
    // Otherwise, only show leave types that match the employee's gender
    return type.eligible_gender === selectedEmployeeGender;
  });

  const createLeaveMutation = useMutation({
    mutationFn: async (values: LeaveFormValues) => {
      const { error } = await supabase.from("hr_leave_requests").insert({
        employee_id: values.employeeId,
        leave_type: values.leaveType,
        start_date: format(values.startDate, "yyyy-MM-dd"),
        end_date: format(values.endDate, "yyyy-MM-dd"),
        reason: values.reason,
        status: "pending"
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء طلب الإجازة",
        description: "تم إرسال طلب الإجازة بنجاح",
      });
      setOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (error) => {
      console.error("Error creating leave request:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إنشاء طلب الإجازة",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: LeaveFormValues) => {
    createLeaveMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <CalendarCheck className="h-4 w-4" />
          إضافة طلب إجازة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة طلب إجازة جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employeeId">الموظف</Label>
            <Select
              onValueChange={(value) => setValue("employeeId", value)} 
              defaultValue={watch("employeeId")}
            >
              <SelectTrigger id="employeeId">
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
            {errors.employeeId && <p className="text-sm text-red-500">{errors.employeeId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leaveType">نوع الإجازة</Label>
            <Select 
              onValueChange={(value) => setValue("leaveType", value)}
              defaultValue={watch("leaveType")}
            >
              <SelectTrigger id="leaveType">
                <SelectValue placeholder="اختر نوع الإجازة" />
              </SelectTrigger>
              <SelectContent>
                {filteredLeaveTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.code}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leaveType && <p className="text-sm text-red-500">{errors.leaveType.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">تاريخ البداية</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right",
                      !watch("startDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {watch("startDate") ? (
                      format(watch("startDate"), "PPP")
                    ) : (
                      <span>اختر التاريخ</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch("startDate")}
                    onSelect={(date) => setValue("startDate", date!)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">تاريخ النهاية</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right",
                      !watch("endDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {watch("endDate") ? (
                      format(watch("endDate"), "PPP")
                    ) : (
                      <span>اختر التاريخ</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch("endDate")}
                    onSelect={(date) => setValue("endDate", date!)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">سبب الإجازة</Label>
            <Textarea
              id="reason"
              placeholder="أدخل سبب الإجازة"
              {...register("reason")}
            />
            {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
          </div>

          <DialogFooter className="gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={createLeaveMutation.isPending}>
              {createLeaveMutation.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

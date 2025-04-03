
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";
import { cn } from "@/lib/utils";

const FormSchema = z.object({
  employee_id: z.string({
    required_error: "يرجى اختيار الموظف",
  }),
  leave_type: z.string({
    required_error: "يرجى اختيار نوع الإجازة",
  }),
  start_date: z.date({
    required_error: "يرجى تحديد تاريخ البداية",
  }),
  end_date: z.date({
    required_error: "يرجى تحديد تاريخ النهاية",
  }),
  reason: z.string().optional(),
});

interface AddLeaveDialogProps {
  onSuccess?: () => void;
  employees: any[];
}

export function AddLeaveDialog({ onSuccess, employees }: AddLeaveDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: leaveTypes, isLoading: isLoadingLeaveTypes } = useLeaveTypes();
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
      // Find the selected employee to check gender
      const selectedEmployee = employees.find(emp => emp.id === data.employee_id);
      const selectedLeaveType = leaveTypes?.find(lt => lt.id === data.leave_type);
      
      // Check if this leave type is eligible for the employee's gender
      if (selectedEmployee && selectedLeaveType && selectedLeaveType.eligible_gender !== 'both') {
        if (selectedLeaveType.eligible_gender === 'male' && selectedEmployee.gender !== 'male') {
          toast({
            title: "عذراً",
            description: "هذا النوع من الإجازات متاح للذكور فقط",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        if (selectedLeaveType.eligible_gender === 'female' && selectedEmployee.gender !== 'female') {
          toast({
            title: "عذراً",
            description: "هذا النوع من الإجازات متاح للإناث فقط",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const { error } = await supabase.from("hr_leave_requests").insert([{
        employee_id: data.employee_id,
        leave_type: data.leave_type,
        start_date: format(data.start_date, 'yyyy-MM-dd'),
        end_date: format(data.end_date, 'yyyy-MM-dd'),
        reason: data.reason || null,
        status: 'pending'
      }]);

      if (error) throw error;

      toast({
        title: "تم إضافة طلب الإجازة بنجاح",
      });
      
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding leave request:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إضافة طلب الإجازة",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter leave types based on the selected employee's gender
  const selectedEmployeeId = form.watch('employee_id');
  const selectedEmployee = selectedEmployeeId ? employees.find(emp => emp.id === selectedEmployeeId) : null;
  
  const filteredLeaveTypes = leaveTypes?.filter(leaveType => {
    if (!selectedEmployee) return true;
    if (!leaveType.eligible_gender || leaveType.eligible_gender === 'both') return true;
    
    return leaveType.eligible_gender === selectedEmployee.gender;
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        إضافة إجازة
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة طلب إجازة جديد</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الموظف</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <FormField
                control={form.control}
                name="leave_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الإجازة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الإجازة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLeaveTypes ? (
                          <SelectItem value="loading" disabled>
                            جاري التحميل...
                          </SelectItem>
                        ) : (
                          filteredLeaveTypes?.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
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
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "d MMMM yyyy", { locale: ar })
                              ) : (
                                <span>اختر التاريخ</span>
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
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "d MMMM yyyy", { locale: ar })
                              ) : (
                                <span>اختر التاريخ</span>
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سبب الإجازة (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="أدخل سبب الإجازة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

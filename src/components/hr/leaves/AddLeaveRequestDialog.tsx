
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInDays, isAfter, isBefore, addDays, parse } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";
import { useLeaveBalance } from "@/hooks/hr/useLeaveBalance";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  leave_type: z.string({
    required_error: "يرجى اختيار نوع الإجازة",
  }),
  start_date: z.date({
    required_error: "يرجى اختيار تاريخ بداية الإجازة",
  }),
  end_date: z.date({
    required_error: "يرجى اختيار تاريخ نهاية الإجازة",
  }),
  reason: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddLeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeaveRequestDialog({ open, onOpenChange }: AddLeaveRequestDialogProps) {
  const { user } = useAuthStore();
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: leaveTypes, isLoading: isLoadingTypes } = useLeaveTypes();
  const { data: leaveBalances, isLoading: isLoadingBalances } = useLeaveBalance(employeeId || undefined);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leave_type: "",
      reason: "",
    },
  });
  
  const { watch, setValue } = form;
  const selectedLeaveType = watch("leave_type");
  const startDate = watch("start_date");
  const endDate = watch("end_date");
  
  const [daysCount, setDaysCount] = useState(0);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);

  // Calculate days difference when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const diff = differenceInDays(endDate, startDate) + 1; // Include both start and end dates
      setDaysCount(diff < 0 ? 0 : diff);
    } else {
      setDaysCount(0);
    }
  }, [startDate, endDate]);

  // Update remaining days when leave type changes
  useEffect(() => {
    if (selectedLeaveType && leaveBalances) {
      const balance = leaveBalances[selectedLeaveType];
      setRemainingDays(balance ? balance.remainingDays : null);
    } else {
      setRemainingDays(null);
    }
  }, [selectedLeaveType, leaveBalances]);

  // Fetch employee ID for current user
  useEffect(() => {
    const fetchEmployeeId = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("id")
          .eq("user_id", user.id)
          .single();
          
        if (error) throw error;
        if (data) setEmployeeId(data.id);
      } catch (error) {
        console.error("Error fetching employee ID:", error);
        toast.error("تعذر الحصول على بيانات الموظف");
      }
    };
    
    fetchEmployeeId();
  }, [user?.id]);

  const createLeaveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!employeeId) throw new Error("لم يتم العثور على بيانات الموظف");
      
      // Validate days against remaining balance
      if (selectedLeaveType && leaveBalances && daysCount > (leaveBalances[selectedLeaveType]?.remainingDays || 0)) {
        throw new Error("عدد أيام الإجازة المطلوبة يتجاوز رصيدك المتبقي");
      }
      
      const { data, error } = await supabase
        .from("hr_leave_requests")
        .insert({
          employee_id: employeeId,
          leave_type: values.leave_type,
          start_date: format(values.start_date, "yyyy-MM-dd"),
          end_date: format(values.end_date, "yyyy-MM-dd"),
          reason: values.reason || null,
          status: "pending",
          days_count: daysCount
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تم إرسال طلب الإجازة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Error creating leave request:", error);
      toast.error(error.message || "حدث خطأ أثناء إرسال طلب الإجازة");
    },
  });

  const onSubmit = (values: FormValues) => {
    // Validate days count against remaining balance
    if (selectedLeaveType && leaveBalances && daysCount > (leaveBalances[selectedLeaveType]?.remainingDays || 0)) {
      toast.error("عدد أيام الإجازة المطلوبة يتجاوز رصيدك المتبقي");
      return;
    }
    
    createLeaveMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>طلب إجازة جديد</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="leave_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الإجازة</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingTypes || !employeeId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الإجازة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingTypes ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        leaveTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{type.name}</span>
                              {leaveBalances && leaveBalances[type.id] && (
                                <Badge variant={leaveBalances[type.id].remainingDays > 0 ? "outline" : "destructive"} className="mr-2">
                                  متبقي: {leaveBalances[type.id].remainingDays} يوم
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  
                  {selectedLeaveType && remainingDays !== null && (
                    <div className="mt-1 text-sm">
                      <span>الرصيد المتبقي: </span>
                      <Badge variant={remainingDays > 0 ? "outline" : "destructive"}>
                        {remainingDays} يوم
                      </Badge>
                    </div>
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
                            variant="outline"
                            className={`w-full pl-3 text-right font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                            disabled={!employeeId}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ar })
                            ) : (
                              <span>اختر التاريخ</span>
                            )}
                            <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => isBefore(date, new Date()) || date < new Date()}
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
                            variant="outline"
                            className={`w-full pl-3 text-right font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                            disabled={!startDate || !employeeId}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ar })
                            ) : (
                              <span>اختر التاريخ</span>
                            )}
                            <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            (startDate && isBefore(date, startDate)) || 
                            date < new Date()
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

            {startDate && endDate && (
              <div className="flex items-center justify-between text-sm">
                <span>عدد أيام الإجازة:</span>
                <Badge variant={
                  selectedLeaveType && remainingDays !== null && daysCount > remainingDays
                    ? "destructive"
                    : "outline"
                }>
                  {daysCount} {daysCount === 1 ? "يوم" : "أيام"}
                  {selectedLeaveType && remainingDays !== null && daysCount > remainingDays && (
                    <span className="mr-1 text-destructive">(يتجاوز رصيدك المتبقي)</span>
                  )}
                </Badge>
              </div>
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الإجازة (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="اكتب سبب الإجازة هنا..."
                      className="resize-none"
                      {...field}
                      disabled={!employeeId}
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
                disabled={
                  createLeaveMutation.isPending || 
                  !employeeId || 
                  (selectedLeaveType && remainingDays !== null && daysCount > remainingDays)
                }
              >
                {createLeaveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جارِ الإرسال...
                  </>
                ) : (
                  "إرسال الطلب"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

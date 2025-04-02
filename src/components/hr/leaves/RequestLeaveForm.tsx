
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";
import { useCreateRequest } from "@/hooks/requests/useCreateRequest";
import { useEmployeeId } from "@/hooks/hr/useEmployeeId";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const leaveFormSchema = z.object({
  leave_type: z.string({ required_error: "يرجى تحديد نوع الإجازة" }),
  start_date: z.date({ required_error: "يرجى تحديد تاريخ البداية" }),
  end_date: z.date({ required_error: "يرجى تحديد تاريخ النهاية" }).refine(
    (date, ctx) => {
      const startDate = ctx.parent.start_date;
      return date >= startDate;
    },
    {
      message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
    }
  ),
  reason: z.string().optional(),
});

type LeaveFormData = z.infer<typeof leaveFormSchema>;

export function RequestLeaveForm() {
  const { data: leaveTypes, isLoading: isLoadingLeaveTypes } = useLeaveTypes();
  const { employeeId } = useEmployeeId();
  const { createRequest, isLoading: isCreatingRequest } = useCreateRequest();
  
  const form = useForm<LeaveFormData>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      reason: "",
    },
  });

  const onSubmit = async (data: LeaveFormData) => {
    if (!employeeId) {
      toast.error("لم يتم العثور على بيانات الموظف");
      return;
    }

    try {
      // Submit request to the request management system
      await createRequest({
        request_type_id: "leave-request", // This should be the actual request type ID for leave requests
        title: `طلب إجازة: ${data.leave_type}`,
        priority: "medium",
        form_data: {
          leave_type: data.leave_type,
          start_date: format(data.start_date, 'yyyy-MM-dd'),
          end_date: format(data.end_date, 'yyyy-MM-dd'),
          employee_id: employeeId,
          reason: data.reason || "",
        },
      });

      toast.success("تم تقديم طلب الإجازة بنجاح");
      form.reset();
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast.error("حدث خطأ أثناء تقديم طلب الإجازة");
    }
  };

  return (
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
                disabled={isLoadingLeaveTypes}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الإجازة" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leaveTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          "pl-3 text-right font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ar })
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
                      disabled={(date) => date < new Date()}
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
                          "pl-3 text-right font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ar })
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
                      disabled={(date) => {
                        const startDate = form.getValues("start_date");
                        return date < (startDate || new Date());
                      }}
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

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isCreatingRequest || isLoadingLeaveTypes}
        >
          {isCreatingRequest && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          تقديم طلب الإجازة
        </Button>
      </form>
    </Form>
  );
}

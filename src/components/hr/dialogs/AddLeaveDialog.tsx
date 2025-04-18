
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";
import { Loader2 } from "lucide-react";

const leaveFormSchema = z.object({
  employee_id: z.string(),
  leave_type: z.string(),
  start_date: z.date(),
  end_date: z.date(),
  reason: z.string().optional(),
  status: z.string().default("pending")
});

export function AddLeaveDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const { data: leaveTypes, isLoading: isLoadingLeaveTypes } = useLeaveTypes();
  
  const form = useForm({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      employee_id: user?.id || "",
      leave_type: "",
      status: "pending",
      reason: ""
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Format dates for Supabase
      const formattedData = {
        ...data,
        start_date: data.start_date.toISOString().split('T')[0],
        end_date: data.end_date.toISOString().split('T')[0],
        leave_type_id: leaveTypes.find(t => t.code === data.leave_type)?.id
      };

      const { error } = await supabase
        .from("hr_leave_requests")
        .insert(formattedData);

      if (error) throw error;

      toast({
        title: "تم تقديم طلب الإجازة بنجاح",
        description: "سيتم مراجعة طلبك من قبل المسؤول"
      });

      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تقديم طلب الإجازة، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          إضافة طلب إجازة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>تقديم طلب إجازة جديد</DialogTitle>
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
                      ) : leaveTypes && leaveTypes.length > 0 ? (
                        leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.code}>
                            {type.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="annual">سنوية</SelectItem>
                          <SelectItem value="sick">مرضية</SelectItem>
                          <SelectItem value="emergency">طارئة</SelectItem>
                          <SelectItem value="maternity">أمومة</SelectItem>
                          <SelectItem value="unpaid">بدون راتب</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>اختر نوع الإجازة المطلوبة</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري التقديم..." : "تقديم طلب الإجازة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

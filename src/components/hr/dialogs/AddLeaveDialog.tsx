// src/components/hr/dialogs/AddLeaveDialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Update the form schema to include start_date and end_date
export function AddLeaveDialog({ isOpen, onClose, employeeId, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  
  // Define or update your form schema to include start_date and end_date
  const leaveFormSchema = z.object({
    leave_type: z.string(),
    status: z.string(),
    reason: z.string().optional(),
    employee_id: z.string(),
    start_date: z.string(), // Add this
    end_date: z.string()    // Add this
  });
  
  type LeaveFormValues = z.infer<typeof leaveFormSchema>;
  
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      leave_type: "",
      status: "pending",
      reason: "",
      employee_id: employeeId,
      start_date: "", // Add default value
      end_date: ""    // Add default value
    }
  });
  
  const onSubmit = async (values: LeaveFormValues) => {
    setIsSubmitting(true);
    try {
      // No need to add start_date and end_date, they're already part of values
      const { error } = await supabase
        .from('hr_leave_requests')
        .insert({
          ...values,
          // Convert string dates to ISO format if needed
          start_date: new Date(values.start_date).toISOString().split('T')[0],
          end_date: new Date(values.end_date).toISOString().split('T')[0]
        });
      
      if (error) throw error;
      
      toast({
        title: "تم إضافة الإجازة بنجاح",
      });
      
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error adding leave:", error);
      toast({
        title: "حدث خطأ أثناء إضافة الإجازة",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة إجازة</DialogTitle>
          <DialogDescription>
            إضافة طلب إجازة جديد للموظف.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <SelectItem value="سنوية">سنوية</SelectItem>
                      <SelectItem value="مرضية">مرضية</SelectItem>
                      <SelectItem value="طارئة">طارئة</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحالة</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">معلقة</SelectItem>
                      <SelectItem value="approved">موافقة</SelectItem>
                      <SelectItem value="rejected">مرفوضة</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_date"
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
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السبب</FormLabel>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  يرجى الانتظار
                </>
              ) : (
                "إضافة الإجازة"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

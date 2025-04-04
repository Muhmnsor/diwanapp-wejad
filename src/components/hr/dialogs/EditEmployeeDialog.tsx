// src/components/hr/dialogs/EditEmployeeDialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSchedules } from "@/hooks/hr/useSchedules";
import { OrganizationalUnitField } from "../fields/OrganizationalUnitField";

const employeeFormSchema = z.object({
  full_name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  position: z.string().optional(),
  department: z.string().optional(),
  gender: z.enum(["ذكر", "أنثى"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  hire_date: z.string().optional(),
  schedule_id: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export function EditEmployeeDialog({ isOpen, onClose, employee, onSuccess }) {
  const { toast } = useToast();
  const { schedules } = useSchedules();
  
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: async () => {
      return {
        full_name: employee?.full_name || "",
        email: employee?.email || "",
        phone: employee?.phone || "",
        position: employee?.position || "",
        department: employee?.department || "",
        gender: employee?.gender || "",
        status: employee?.status || "active",
        hire_date: employee?.hire_date ? format(new Date(employee.hire_date), "yyyy-MM-dd") : "",
        schedule_id: employee?.schedule_id || "",
      };
    }
  });
  
  const onSubmit = async (values) => {
    const { 
      full_name, 
      email, 
      phone, 
      position, 
      department, 
      gender, 
      status, 
      hire_date,
      schedule_id 
    } = values;
    
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({
          full_name,
          email,
          phone,
          position,
          department,
          gender,
          status,
          hire_date,
          schedule_id
        })
        .eq('id', employee.id);
      
      if (error) throw error;
      
      toast({
        title: "تم تعديل بيانات الموظف بنجاح",
      });
      
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "حدث خطأ أثناء تعديل بيانات الموظف",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الموظف</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input placeholder="الاسم الكامل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input placeholder="البريد الإلكتروني" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <Input placeholder="رقم الهاتف" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المسمى الوظيفي</FormLabel>
                  <FormControl>
                    <Input placeholder="المسمى الوظيفي" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <OrganizationalUnitField form={form} />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>النوع</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ذكر">ذكر</SelectItem>
                      <SelectItem value="أنثى">أنثى</SelectItem>
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>نشط</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      تفعيل / تعطيل حساب الموظف
                    </p>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value === "active"}
                      onCheckedChange={(checked) => {
                        field.onChange(checked ? "active" : "inactive")
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hire_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ التعيين</FormLabel>
                  <DatePicker 
                    date={field.value ? new Date(field.value) : undefined} 
                    setDate={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")} 
                    locale="ar" 
                    placeholder="اختر تاريخ التعيين" 
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schedule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الجدول الزمني</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الجدول الزمني" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schedules.map((schedule) => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          {schedule.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">تعديل</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

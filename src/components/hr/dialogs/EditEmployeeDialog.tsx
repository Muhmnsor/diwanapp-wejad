
import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { EmployeeScheduleField } from "@/components/hr/fields/EmployeeScheduleField";
import { OrganizationalUnitField } from "@/components/hr/fields/OrganizationalUnitField";
import { useUpdateEmployee } from "@/hooks/hr/useEmployees";

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any;
}

const formSchema = z.object({
  full_name: z.string().min(2, { message: "الاسم مطلوب" }),
  employee_number: z.string().optional(),
  position: z.string().optional(),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  department: z.string().optional(),
  gender: z.string().optional(),
  schedule_id: z.string().uuid().optional(),
  hire_date: z.string().optional(),
  status: z.string().optional(),
});

export function EditEmployeeDialog({ open, onOpenChange, employee }: EditEmployeeDialogProps) {
  const { toast } = useToast();
  const { mutate: updateEmployee, isPending } = useUpdateEmployee();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      employee_number: "",
      position: "",
      email: "",
      phone: "",
      department: "",
      gender: "",
      schedule_id: undefined,
      hire_date: "",
      status: "",
    },
  });

  useEffect(() => {
    if (employee) {
      // Format date for HTML input (YYYY-MM-DD)
      const formattedHireDate = employee.hire_date 
        ? new Date(employee.hire_date).toISOString().split('T')[0] 
        : "";
        
      form.reset({
        full_name: employee.full_name || "",
        employee_number: employee.employee_number || "",
        position: employee.position || "",
        email: employee.email || "",
        phone: employee.phone || "",
        department: employee.department || "",
        gender: employee.gender || "",
        schedule_id: employee.schedule_id,
        hire_date: formattedHireDate,
        status: employee.status || "active",
      });
    }
  }, [employee, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Updating employee data:", values);
    updateEmployee(
      { id: employee.id, employeeData: values },
      {
        onSuccess: () => {
          toast({
            title: "تم تحديث بيانات الموظف",
            description: "تم تحديث بيانات الموظف بنجاح",
          });
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("Error updating employee:", error);
          toast({
            variant: "destructive",
            title: "خطأ في تحديث بيانات الموظف",
            description: "حدث خطأ أثناء تحديث بيانات الموظف، يرجى المحاولة مرة أخرى",
          });
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الموظف</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل الاسم الكامل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="employee_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرقم الوظيفي</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل الرقم الوظيفي" {...field} />
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
                    <FormLabel>المنصب</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل المنصب" {...field} />
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
                      <Input
                        type="email"
                        placeholder="أدخل البريد الإلكتروني"
                        {...field}
                      />
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
                      <Input placeholder="أدخل رقم الهاتف" {...field} />
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
                    <FormLabel>الجنس</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الجنس" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">ذكر</SelectItem>
                        <SelectItem value="female">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ التعيين</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="on_leave">في إجازة</SelectItem>
                        <SelectItem value="terminated">منتهي الخدمة</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <EmployeeScheduleField form={form} />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري التحديث..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

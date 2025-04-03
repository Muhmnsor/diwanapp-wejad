
import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useUpdateEmployee } from "@/hooks/hr/useEmployees";
import { EmployeeScheduleField } from "@/components/hr/fields/EmployeeScheduleField";
import { OrganizationalUnitField } from "@/components/hr/fields/OrganizationalUnitField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  employee: any;
}

const formSchema = z.object({
  full_name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  position: z.string().min(1, "المنصب مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  phone: z.string().optional(),
  department: z.string().min(1, "القسم مطلوب"),
  schedule_id: z.string().optional(),
  gender: z.enum(["ذكر", "أنثى"]),
  hire_date: z.string().optional(),
  status: z.string().default("active"),
});

export function EditEmployeeDialog({ isOpen, onClose, onSuccess, employee }: EditEmployeeDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      position: "",
      email: "",
      phone: "",
      department: "",
      schedule_id: undefined,
      gender: "ذكر",
      hire_date: "",
      status: "active",
    },
  });

  const updateEmployee = useUpdateEmployee();

  useEffect(() => {
    if (employee && isOpen) {
      form.reset({
        full_name: employee.full_name || "",
        position: employee.position || "",
        email: employee.email || "",
        phone: employee.phone || "",
        department: employee.department || "",
        schedule_id: employee.schedule_id || undefined,
        gender: employee.gender || "ذكر",
        hire_date: employee.hire_date ? new Date(employee.hire_date).toISOString().split('T')[0] : "",
        status: employee.status || "active",
      });
    }
  }, [employee, isOpen, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateEmployee.mutateAsync({
        id: employee.id,
        employeeData: values,
      });
      
      toast({
        title: "تم تحديث بيانات الموظف بنجاح",
        description: `تم تحديث بيانات ${values.full_name}`,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "خطأ في تحديث بيانات الموظف",
        description: "حدث خطأ أثناء تحديث بيانات الموظف، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
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
                    <Input placeholder="أدخل اسم الموظف" {...field} />
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
                    <Input placeholder="أدخل المنصب الوظيفي" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل البريد الإلكتروني" {...field} />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem value="ذكر">ذكر</SelectItem>
                        <SelectItem value="أنثى">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem value="terminated">منتهي</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <EmployeeScheduleField form={form} />

            <DialogFooter>
              <Button type="submit" disabled={updateEmployee.isPending}>
                {updateEmployee.isPending ? "جارٍ التحديث..." : "تحديث بيانات الموظف"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

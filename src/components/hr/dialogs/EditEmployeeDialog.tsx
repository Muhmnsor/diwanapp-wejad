
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { OrganizationalUnitField } from "@/components/hr/fields/OrganizationalUnitField";
import { EmployeeScheduleField } from "@/components/hr/fields/EmployeeScheduleField";
import { useUpdateEmployee } from "@/hooks/hr/useEmployees";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  full_name: z.string().min(3, "يجب أن يحتوي الاسم على 3 أحرف على الأقل"),
  email: z.string().email("يجب إدخال بريد إلكتروني صحيح").optional().or(z.literal("")),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  employee_number: z.string().optional(),
  schedule_id: z.string().optional(),
});

export interface EditEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  employee: any;
  onSuccess: () => void;
}

export function EditEmployeeDialog({ open, onClose, employee, onSuccess }: EditEmployeeDialogProps) {
  const { toast } = useToast();
  const { mutateAsync: updateEmployee, isPending } = useUpdateEmployee();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      employee_number: "",
      schedule_id: "",
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        full_name: employee.full_name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        position: employee.position || "",
        department: employee.department || "",
        employee_number: employee.employee_number || "",
        schedule_id: employee.schedule_id || "",
      });
    }
  }, [employee, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!employee?.id) return;
    
    try {
      await updateEmployee({
        id: employee.id,
        employeeData: values,
      });
      
      toast({
        title: "تم تحديث بيانات الموظف",
        description: "تم تحديث بيانات الموظف بنجاح",
      });
      
      onSuccess();
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الموظف</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل البريد الإلكتروني" type="email" {...field} />
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

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المسمى الوظيفي</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل المسمى الوظيفي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <OrganizationalUnitField form={form} />
              <EmployeeScheduleField form={form} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري التحديث..." : "تحديث البيانات"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

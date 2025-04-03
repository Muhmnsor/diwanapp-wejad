
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useUpdateEmployee } from "@/hooks/hr/useEmployees";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { EmployeeScheduleField } from "@/components/hr/fields/EmployeeScheduleField";
import { OrganizationalUnitField } from "@/components/hr/fields/OrganizationalUnitField";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const formSchema = z.object({
  full_name: z.string().min(2, { message: "الاسم مطلوب" }),
  position: z.string().min(2, { message: "المنصب مطلوب" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  phone: z.string().min(9, { message: "رقم الهاتف مطلوب" }),
  department: z.string().optional(),
  schedule_id: z.string().optional(),
  employee_number: z.string().optional(),
  hire_date: z.string().optional(),
  status: z.string().optional(),
});

export type EditEmployeeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any;
  onSuccess: () => void;
};

export function EditEmployeeDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: EditEmployeeDialogProps) {
  const { toast } = useToast();
  const { mutateAsync: updateEmployee, isPending } = useUpdateEmployee();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      position: "",
      email: "",
      phone: "",
      department: "",
      schedule_id: "",
      employee_number: "",
      hire_date: new Date().toISOString().split('T')[0],
      status: "active",
    },
  });

  useEffect(() => {
    if (employee && open) {
      // Format date to YYYY-MM-DD for input
      const formattedHireDate = employee.hire_date 
        ? new Date(employee.hire_date).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0];

      form.reset({
        full_name: employee.full_name || "",
        position: employee.position || "",
        email: employee.email || "",
        phone: employee.phone || "",
        department: employee.department || "",
        schedule_id: employee.schedule_id || "",
        employee_number: employee.employee_number || "",
        hire_date: formattedHireDate,
        status: employee.status || "active",
      });
    }
  }, [employee, form, open]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateEmployee({
        id: employee.id,
        employeeData: {
          ...values,
          updated_at: new Date().toISOString(),
        },
      });
      toast({
        title: "تم تحديث بيانات الموظف بنجاح",
        variant: "default",
      });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "حدث خطأ أثناء تحديث بيانات الموظف",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل بيانات الموظف</DialogTitle>
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

              <OrganizationalUnitField form={form} />

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

              <EmployeeScheduleField form={form} />
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري التحديث..." : "تحديث البيانات"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUpdateEmployee } from "@/hooks/hr/useEmployees";
import { toast } from "@/components/ui/use-toast";
import { EmployeeScheduleField } from "@/components/hr/employees/EmployeeScheduleField";

// Schema for form validation
const formSchema = z.object({
  full_name: z.string().min(2, "الاسم مطلوب ويجب أن يحتوي على حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح").or(z.literal("")),
  phone: z.string().min(10, "رقم الهاتف يجب أن يحتوي على 10 أرقام على الأقل").or(z.literal("")),
  department: z.string().min(1, "القسم مطلوب"),
  position: z.string().min(1, "المسمى الوظيفي مطلوب"),
  hire_date: z.string().min(1, "تاريخ التعيين مطلوب"),
  status: z.enum(["active", "inactive", "terminated", "on_leave"]),
  contract_type: z.enum(["full_time", "part_time", "contractor", "intern", "volunteer"]),
  notes: z.string().optional(),
  schedule_id: z.string().optional(),
  employee_number: z.string().min(1, "الرقم الوظيفي مطلوب")
});

type FormValues = z.infer<typeof formSchema>;

interface EditEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any; // استخدام النوع المناسب إذا كان متوفرًا
}

export function EditEmployeeDialog({ isOpen, onClose, employee }: EditEmployeeDialogProps) {
  const { mutateAsync: updateEmployee, isPending } = useUpdateEmployee();
  const [scheduleId, setScheduleId] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      hire_date: "",
      status: "active" as const,
      contract_type: "full_time" as const,
      notes: "",
      schedule_id: "",
      employee_number: ""
    }
  });

  // تحديث قيم النموذج عند تغير بيانات الموظف
  useEffect(() => {
    if (employee) {
      form.reset({
        full_name: employee.full_name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        department: employee.department || "",
        position: employee.position || "",
        hire_date: employee.hire_date || new Date().toISOString().split("T")[0],
        status: employee.status || "active",
        contract_type: employee.contract_type || "full_time",
        notes: employee.notes || "",
        schedule_id: employee.schedule_id || "",
        employee_number: employee.employee_number || ""
      });
      
      setScheduleId(employee.schedule_id || "");
    }
  }, [employee, form]);

  const onSubmit = async (values: FormValues) => {
    if (!employee?.id) return;
    
    try {
      const employeeData = {
        ...values,
        schedule_id: scheduleId
      };
      
      await updateEmployee({ id: employee.id, employeeData });
      toast({
        title: "تم تحديث بيانات الموظف بنجاح",
        description: `تم تحديث بيانات ${values.full_name}.`,
      });
      onClose();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "خطأ في تحديث بيانات الموظف",
        description: "حدث خطأ أثناء محاولة تحديث بيانات الموظف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const handleScheduleChange = (value: string) => {
    setScheduleId(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الموظف</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* المعلومات الأساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الموظف</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* معلومات الوظيفة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القسم</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر حالة الموظف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                        <SelectItem value="terminated">منتهي</SelectItem>
                        <SelectItem value="on_leave">في إجازة</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contract_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع العقد</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع العقد" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full_time">دوام كامل</SelectItem>
                        <SelectItem value="part_time">دوام جزئي</SelectItem>
                        <SelectItem value="contractor">متعاقد</SelectItem>
                        <SelectItem value="intern">متدرب</SelectItem>
                        <SelectItem value="volunteer">متطوع</SelectItem>
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
            </div>
            
            {/* ربط الجدول الزمني */}
            <EmployeeScheduleField 
              employeeId={employee?.id || ""}
              scheduleId={scheduleId}
              onScheduleChange={handleScheduleChange}
            />
            
            {/* ملاحظات إضافية */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="أي ملاحظات إضافية حول الموظف..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* أزرار التحكم */}
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="ml-2"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري التحديث..." : "حفظ التغييرات"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

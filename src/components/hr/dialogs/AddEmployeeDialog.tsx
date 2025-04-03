
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAddEmployee } from "@/hooks/hr/useEmployees";
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

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddEmployeeDialog({ isOpen, onClose }: AddEmployeeDialogProps) {
  const { mutateAsync: addEmployee, isPending } = useAddEmployee();
  const [scheduleId, setScheduleId] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      hire_date: new Date().toISOString().split("T")[0],
      status: "active",
      contract_type: "full_time",
      notes: "",
      schedule_id: "",
      employee_number: ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const employeeData = {
        ...values,
        schedule_id: scheduleId
      };
      
      await addEmployee(employeeData);
      toast({
        title: "تم إضافة الموظف بنجاح",
        description: `تم إضافة ${values.full_name} إلى قائمة الموظفين.`,
      });
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: "خطأ في إضافة الموظف",
        description: "حدث خطأ أثناء محاولة إضافة الموظف. يرجى المحاولة مرة أخرى.",
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
          <DialogTitle>إضافة موظف جديد</DialogTitle>
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
              employeeId=""
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
                {isPending ? "جاري الإضافة..." : "إضافة الموظف"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

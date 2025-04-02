import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { GenderField } from "@/components/hr/fields/GenderField";
import { OrganizationalUnitField } from "@/components/hr/fields/OrganizationalUnitField";
import { EmployeeScheduleField } from "@/components/hr/fields/EmployeeScheduleField";
const employeeFormSchema = z.object({
  full_name: z.string().min(3, {
    message: "الاسم مطلوب"
  }),
  employee_number: z.string().min(1, {
    message: "الرقم الوظيفي مطلوب"
  }),
  email: z.string().email({
    message: "يرجى إدخال بريد إلكتروني صالح"
  }).optional().or(z.literal("")),
  phone: z.string().optional(),
  gender: z.string().optional(),
  position: z.string().optional(),
  department_id: z.string().optional(),
  hire_date: z.date().optional(),
  schedule_id: z.string().optional(),
  status: z.string().default("active")
});
type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
export function AddEmployeeDialog({
  isOpen,
  onClose,
  onSuccess
}: AddEmployeeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departmentName, setDepartmentName] = useState<string>("");
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      full_name: "",
      employee_number: "",
      email: "",
      phone: "",
      gender: undefined,
      position: "",
      department_id: undefined,
      hire_date: undefined,
      schedule_id: "",
      status: "active"
    }
  });
  const handleSubmit = async (values: EmployeeFormValues) => {
    setIsSubmitting(true);
    try {
      // Insert employee record
      const {
        data: employee,
        error: employeeError
      } = await supabase.from('employees').insert({
        full_name: values.full_name,
        employee_number: values.employee_number,
        email: values.email || null,
        phone: values.phone || null,
        gender: values.gender || null,
        position: values.position || null,
        department: departmentName || null,
        hire_date: values.hire_date ? format(values.hire_date, 'yyyy-MM-dd') : null,
        schedule_id: values.schedule_id || null,
        status: values.status
      }).select('id').single();
      if (employeeError) throw employeeError;

      // If department is selected, add relationship to organizational_units
      if (values.department_id && employee) {
        const {
          error: orgUnitError
        } = await supabase.from('employee_organizational_units').insert({
          employee_id: employee.id,
          organizational_unit_id: values.department_id,
          is_primary: true
        });
        if (orgUnitError) throw orgUnitError;
      }
      toast.success("تم إضافة الموظف بنجاح");
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error("حدث خطأ أثناء إضافة الموظف");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>إضافة موظف جديد</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* الاسم الكامل */}
              <FormField control={form.control} name="full_name" render={({
              field
            }) => <FormItem>
                    <FormLabel>الاسم الكامل<span className="text-red-500 mr-1">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل الاسم الكامل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {/* الرقم الوظيفي */}
              <FormField control={form.control} name="employee_number" render={({
              field
            }) => <FormItem>
                    <FormLabel>الرقم الوظيفي<span className="text-red-500 mr-1">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل الرقم الوظيفي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {/* البريد الإلكتروني */}
              <FormField control={form.control} name="email" render={({
              field
            }) => <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="أدخل البريد الإلكتروني" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {/* رقم الهاتف */}
              <FormField control={form.control} name="phone" render={({
              field
            }) => <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل رقم الهاتف" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {/* المسمى الوظيفي */}
              <FormField control={form.control} name="position" render={({
              field
            }) => <FormItem>
                    <FormLabel>المسمى الوظيفي</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل المسمى الوظيفي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {/* الجنس */}
              <FormField control={form.control} name="gender" render={({
              field
            }) => <FormItem>
                    
                    <FormControl>
                      <GenderField value={field.value || ""} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {/* القسم/الإدارة */}
              <FormField control={form.control} name="department_id" render={({
              field
            }) => <FormItem>
                    <FormControl>
                      <OrganizationalUnitField value={field.value || ""} onChange={(value, name) => {
                  field.onChange(value);
                  setDepartmentName(name || "");
                }} label="القسم/الإدارة" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {/* جدول العمل */}
              <FormField control={form.control} name="schedule_id" render={({
              field
            }) => <FormItem>
                    <FormControl>
                      <EmployeeScheduleField value={field.value || ""} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {/* تاريخ التعيين */}
              <FormField control={form.control} name="hire_date" render={({
              field
            }) => <FormItem>
                    <FormLabel>تاريخ التعيين</FormLabel>
                    <FormControl>
                      <DatePicker date={field.value} setDate={field.onChange} locale="ar" placeholder="اختر تاريخ التعيين" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
}
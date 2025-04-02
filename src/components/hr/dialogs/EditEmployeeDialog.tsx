
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format, parse } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { GenderField } from "@/components/hr/fields/GenderField";
import { OrganizationalUnitField } from "@/components/hr/fields/OrganizationalUnitField";
import { EmployeeScheduleField } from "@/components/hr/fields/EmployeeScheduleField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const employeeFormSchema = z.object({
  full_name: z.string().min(3, { message: "الاسم مطلوب" }),
  employee_number: z.string().min(1, { message: "الرقم الوظيفي مطلوب" }),
  email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صالح" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  gender: z.string().optional(),
  position: z.string().optional(),
  department_id: z.string().optional(),
  hire_date: z.date().optional(),
  schedule_id: z.string().optional(),
  status: z.string(),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface Employee {
  id: string;
  full_name: string;
  employee_number?: string;
  email?: string;
  phone?: string;
  gender?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  schedule_id?: string;
  status: string;
}

interface EditEmployeeDialogProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEmployeeDialog({ employee, isOpen, onClose, onSuccess }: EditEmployeeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [departmentName, setDepartmentName] = useState<string>("");
  
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      full_name: employee.full_name,
      employee_number: employee.employee_number || "",
      email: employee.email || "",
      phone: employee.phone || "",
      gender: employee.gender || undefined,
      position: employee.position || "",
      department_id: undefined, // Will be set after loading
      hire_date: employee.hire_date ? new Date(employee.hire_date) : undefined,
      schedule_id: employee.schedule_id || "",
      status: employee.status,
    },
  });

  // Load the organizational unit on component mount
  useEffect(() => {
    const loadOrganizationalUnit = async () => {
      try {
        const { data, error } = await supabase
          .from('employee_organizational_units')
          .select('organizational_unit_id, organizational_units(id, name)')
          .eq('employee_id', employee.id)
          .eq('is_primary', true)
          .single();
          
        if (error) throw error;
        
        if (data) {
          const departmentId = data.organizational_unit_id;
          const departmentName = data.organizational_units?.name || "";
          
          setDepartmentId(departmentId);
          setDepartmentName(departmentName);
          
          // Update the form
          form.setValue("department_id", departmentId);
        }
      } catch (error) {
        console.error('Error loading organizational unit:', error);
      }
    };
    
    if (isOpen && employee.id) {
      loadOrganizationalUnit();
    }
  }, [isOpen, employee.id, form]);

  const handleSubmit = async (values: EmployeeFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Update employee record
      const { error: employeeError } = await supabase
        .from('employees')
        .update({
          full_name: values.full_name,
          employee_number: values.employee_number,
          email: values.email || null,
          phone: values.phone || null,
          gender: values.gender || null,
          position: values.position || null,
          department: departmentName || null,
          hire_date: values.hire_date ? format(values.hire_date, 'yyyy-MM-dd') : null,
          schedule_id: values.schedule_id || null,
          status: values.status,
        })
        .eq('id', employee.id);
        
      if (employeeError) throw employeeError;
      
      // If department is selected and changed
      if (values.department_id && values.department_id !== departmentId) {
        // Check if there's an existing relationship
        const { data: existingData, error: checkError } = await supabase
          .from('employee_organizational_units')
          .select('id')
          .eq('employee_id', employee.id)
          .eq('is_primary', true);
          
        if (checkError) throw checkError;
        
        if (existingData && existingData.length > 0) {
          // Update existing relationship
          const { error: updateError } = await supabase
            .from('employee_organizational_units')
            .update({
              organizational_unit_id: values.department_id,
            })
            .eq('employee_id', employee.id)
            .eq('is_primary', true);
            
          if (updateError) throw updateError;
        } else {
          // Create new relationship
          const { error: insertError } = await supabase
            .from('employee_organizational_units')
            .insert({
              employee_id: employee.id,
              organizational_unit_id: values.department_id,
              is_primary: true,
            });
            
          if (insertError) throw insertError;
        }
      }
      
      toast.success("تم تحديث بيانات الموظف بنجاح");
      onSuccess();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error("حدث خطأ أثناء تحديث بيانات الموظف");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الموظف</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* الاسم الكامل */}
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الكامل<span className="text-red-500 mr-1">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل الاسم الكامل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* الرقم الوظيفي */}
              <FormField
                control={form.control}
                name="employee_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرقم الوظيفي<span className="text-red-500 mr-1">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل الرقم الوظيفي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* البريد الإلكتروني */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="أدخل البريد الإلكتروني" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* رقم الهاتف */}
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
              
              {/* المسمى الوظيفي */}
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
              
              {/* الجنس */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الجنس</FormLabel>
                    <FormControl>
                      <GenderField 
                        value={field.value || ""} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* القسم/الإدارة */}
              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <OrganizationalUnitField 
                        value={field.value || ""} 
                        onChange={(value, name) => {
                          field.onChange(value);
                          setDepartmentName(name || "");
                        }}
                        label="القسم/الإدارة"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* جدول العمل */}
              <FormField
                control={form.control}
                name="schedule_id"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <EmployeeScheduleField 
                        value={field.value || ""} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* تاريخ التعيين */}
              <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ التعيين</FormLabel>
                    <FormControl>
                      <DatePicker 
                        date={field.value} 
                        setDate={field.onChange}
                        locale="ar"
                        placeholder="اختر تاريخ التعيين"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* حالة الموظف */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر حالة الموظف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">موظف حالي</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                        <SelectItem value="terminated">منتهي</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

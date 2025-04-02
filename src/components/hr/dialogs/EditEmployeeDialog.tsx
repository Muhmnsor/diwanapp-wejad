
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Employee {
  id: string;
  employee_number: string;
  full_name: string;
  email?: string;
  position?: string;
  department?: string;
  joining_date?: string;
  phone?: string;
  schedule_id?: string;
  status?: string;
}

interface EditEmployeeDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEmployeeDialog({ employee, isOpen, onClose, onSuccess }: EditEmployeeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    defaultValues: {
      full_name: employee?.full_name || "",
      employee_number: employee?.employee_number || "",
      position: employee?.position || "",
      department: employee?.department || "",
      email: employee?.email || "",
      phone: employee?.phone || "",
      joining_date: employee?.joining_date ? new Date(employee.joining_date).toISOString().split('T')[0] : "",
      status: employee?.status || "active",
    },
  });

  const handleSubmit = async (data: any) => {
    if (!employee) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          full_name: data.full_name,
          employee_number: data.employee_number,
          position: data.position,
          department: data.department,
          email: data.email,
          phone: data.phone,
          joining_date: data.joining_date,
          status: data.status,
        })
        .eq('id', employee.id);
        
      if (error) throw error;
      
      toast.success("تم تحديث بيانات الموظف بنجاح");
      onSuccess();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error("حدث خطأ أثناء تحديث بيانات الموظف");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form when employee changes
  useState(() => {
    if (employee) {
      form.reset({
        full_name: employee.full_name || "",
        employee_number: employee.employee_number || "",
        position: employee.position || "",
        department: employee.department || "",
        email: employee.email || "",
        phone: employee.phone || "",
        joining_date: employee.joining_date ? new Date(employee.joining_date).toISOString().split('T')[0] : "",
        status: employee.status || "active",
      });
    }
  });
  
  if (!employee) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">تعديل بيانات الموظف</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
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
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المنصب</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input {...field} dir="ltr" type="email" />
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
                    <Input {...field} dir="ltr" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="joining_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ التعيين</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
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
                  <FormControl>
                    <select
                      className="w-full flex h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                      {...field}
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 mt-4">
              <Button variant="outline" type="button" onClick={onClose}>
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


import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useEmployeeOperations } from "@/hooks/hr/useEmployeeOperations";
import { EmployeeScheduleField } from "@/components/hr/employees/EmployeeScheduleField";
import { OrganizationalUnitField } from "@/components/hr/fields/OrganizationalUnitField";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const employeeFormSchema = z.object({
  first_name: z.string().min(2, "الاسم الأول مطلوب"),
  last_name: z.string().min(2, "الاسم الأخير مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().min(10, "رقم الهاتف مطلوب"),
  job_title: z.string().min(2, "المسمى الوظيفي مطلوب"),
  department: z.string().min(1, "القسم مطلوب"),
  hire_date: z.string().min(1, "تاريخ التعيين مطلوب"),
  employee_id_number: z.string().optional(),
  schedule_id: z.string().min(1, "جدول العمل مطلوب"),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export function AddEmployeeDialog() {
  const [open, setOpen] = useState(false);
  const { addEmployee, isLoading } = useEmployeeOperations();
  
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      job_title: "",
      department: "",
      hire_date: new Date().toISOString().slice(0, 10),
      employee_id_number: "",
      schedule_id: "",
    },
  });
  
  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      const result = await addEmployee(values);
      if (result.success) {
        toast({
          title: "تم إضافة الموظف بنجاح",
          description: `تمت إضافة ${values.first_name} ${values.last_name} إلى قائمة الموظفين.`,
        });
        form.reset();
        setOpen(false);
      } else {
        toast({
          title: "خطأ في إضافة الموظف",
          description: result.error || "حدث خطأ أثناء إضافة الموظف، يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: "خطأ في إضافة الموظف",
        description: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>إضافة موظف جديد</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة موظف جديد</DialogTitle>
          <DialogDescription>
            أدخل معلومات الموظف الجديد أدناه
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الأول</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الأخير</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
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
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="job_title"
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
              
              <OrganizationalUnitField form={form} />
              
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
                name="employee_id_number"
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
            </div>
            
            <FormField
              control={form.control}
              name="schedule_id"
              render={({ field }) => (
                <FormItem>
                  <EmployeeScheduleField
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                إضافة الموظف
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

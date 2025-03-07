
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProjectEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    description: string | null;
    startDate: string | null;
    dueDate: string | null;
    status: string;
    managerId: string | null;
    managerName: string | null;
  };
}

const formSchema = z.object({
  name: z.string().min(2, "يجب أن يكون اسم المشروع حرفين على الأقل"),
  description: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
});

export const ProjectEditDialog = ({ isOpen, onClose, project }: ProjectEditDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);

  // Fetch project managers when dialog opens
  useState(() => {
    const fetchManagers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name')
          .eq('is_active', true);
          
        if (error) {
          console.error('Error fetching managers:', error);
          return;
        }
        
        setManagers(data.map(user => ({
          id: user.id,
          name: user.display_name || 'مستخدم بدون اسم'
        })));
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    if (isOpen) {
      fetchManagers();
    }
  }, [isOpen]);
  
  // Initialize form with project data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name,
      description: project.description || "",
      startDate: project.startDate || "",
      dueDate: project.dueDate || "",
      managerId: project.managerId || "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({
          title: values.name,
          description: values.description,
          start_date: values.startDate || null,
          due_date: values.dueDate || null,
          project_manager: values.managerId || null,
        })
        .eq('id', project.id);
        
      if (error) {
        throw error;
      }
      
      toast.success("تم تحديث المشروع بنجاح");
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error("حدث خطأ أثناء تحديث المشروع");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-lg">تعديل المشروع</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rtl">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المشروع</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم المشروع" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف المشروع</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أدخل وصف المشروع" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ البدء</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الانتهاء</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مدير المشروع</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مدير المشروع" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">بدون مدير</SelectItem>
                      {managers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="ml-2"
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
};

export default ProjectEditDialog;

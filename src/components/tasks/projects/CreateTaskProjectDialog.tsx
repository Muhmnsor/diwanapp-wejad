
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface CreateTaskProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export const CreateTaskProjectDialog = ({ 
  open, 
  onOpenChange, 
  workspaceId 
}: CreateTaskProjectDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("يرجى إدخال اسم المشروع");
      return;
    }

    if (!workspaceId) {
      toast.error("لم يتم تحديد مساحة العمل");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Creating project with workspace_id:", workspaceId);
      console.log("Form data:", formData);
      
      // أولاً، نقوم بإنشاء سجل في جدول المشاريع (إذا لم يكن موجودًا)
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            title: formData.name,
            description: formData.description,
            start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
            end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
            image_url: '/placeholder.svg', // صورة افتراضية
            event_type: 'task',
            project_type: 'task_project',
            beneficiary_type: 'both',
            event_path: 'administrative',
            event_category: 'administrative',
            is_visible: true
          }
        ])
        .select();
      
      if (projectError) {
        console.error("Error creating project:", projectError);
        throw projectError;
      }
      
      if (!projectData || projectData.length === 0) {
        throw new Error("فشل إنشاء المشروع، لم يتم إرجاع البيانات");
      }
      
      const projectId = projectData[0].id;
      
      // ثم نقوم بإنشاء مهمة مرتبطة بالمشروع في جدول مهام المشاريع
      const { data: taskData, error: taskError } = await supabase
        .from('project_tasks')
        .insert([
          {
            title: formData.name,
            description: formData.description,
            project_id: projectId, // استخدام معرف المشروع الذي تم إنشاؤه
            workspace_id: workspaceId, // إضافة معرف مساحة العمل
            due_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
            status: 'pending',
          }
        ]);
      
      if (taskError) {
        console.error("Error creating task project:", taskError);
        throw taskError;
      }
      
      console.log("Project and task created successfully:", { project: projectData, task: taskData });
      toast.success("تم إنشاء مشروع المهام بنجاح");
      
      // إعادة تحميل قائمة المشاريع
      queryClient.invalidateQueries({ queryKey: ['task-projects', workspaceId] });
      
      // إغلاق النافذة المنبثقة وإعادة تعيين النموذج
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
      });
    } catch (error) {
      console.error("Error creating task project:", error);
      toast.error("حدث خطأ أثناء إنشاء مشروع المهام");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إنشاء مشروع مهام جديد</DialogTitle>
          <DialogDescription>أدخل تفاصيل المشروع الجديد</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right block">اسم المشروع</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسم المشروع"
              required
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-right block">وصف المشروع</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="أدخل وصف المشروع"
              rows={4}
              className="text-right"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-right block">تاريخ البداية</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-right block">تاريخ النهاية</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                className="text-right"
              />
            </div>
          </div>

          <div className="flex justify-start gap-2 mt-6">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              {isLoading ? "جاري الإنشاء..." : "إنشاء مشروع المهام"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

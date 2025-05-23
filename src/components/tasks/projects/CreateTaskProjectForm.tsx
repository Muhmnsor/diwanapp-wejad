
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreateTaskProjectFormProps {
  workspaceId?: string;
}

export const CreateTaskProjectForm = ({ workspaceId }: CreateTaskProjectFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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
      
      const { data, error } = await supabase
        .from('project_tasks')
        .insert([
          {
            title: formData.name,
            description: formData.description,
            workspace_id: workspaceId,
            due_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
            status: 'pending',
          }
        ]);
      
      if (error) {
        console.error("Error creating task project:", error);
        throw error;
      }
      
      console.log("Project created successfully:", data);
      toast.success("تم إنشاء مشروع المهام بنجاح");
      navigate(`/tasks/workspace/${workspaceId}`);
    } catch (error) {
      console.error("Error creating task project:", error);
      toast.error("حدث خطأ أثناء إنشاء مشروع المهام");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/tasks/workspace/${workspaceId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-6 text-right">
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
        <div className="space-y-2 md:order-1">
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
        <div className="space-y-2 md:order-2">
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
          onClick={handleCancel}
          disabled={isLoading}
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
};

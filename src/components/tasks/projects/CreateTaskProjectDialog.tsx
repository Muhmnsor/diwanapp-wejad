
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateTaskProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

interface User {
  id: string;
  display_name?: string;
  email?: string;
}

export const CreateTaskProjectDialog = ({ 
  open, 
  onOpenChange, 
  workspaceId 
}: CreateTaskProjectDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    manager_id: "",
  });

  // جلب قائمة المستخدمين
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .eq('is_active', true)
          .order('display_name', { ascending: true });

        if (error) {
          console.error("خطأ في جلب المستخدمين:", error);
          return;
        }

        if (data) {
          setUsers(data);
        }
      } catch (error) {
        console.error("خطأ في جلب المستخدمين:", error);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
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
      console.log("Creating task project with workspace_id:", workspaceId);
      console.log("Form data:", formData);
      
      // نقوم بإنشاء المشروع في جدول project_tasks مباشرة
      const { data: taskData, error: taskError } = await supabase
        .from('project_tasks')
        .insert([
          {
            title: formData.name,
            description: formData.description,
            workspace_id: workspaceId,
            due_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
            status: 'pending',
            assigned_to: formData.manager_id || null,
          }
        ]);
      
      if (taskError) {
        console.error("Error creating task project:", taskError);
        throw taskError;
      }
      
      console.log("Task project created successfully:", taskData);
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
        manager_id: "",
      });
    } catch (error) {
      console.error("Error creating task project:", error);
      toast.error("حدث خطأ أثناء إنشاء مشروع المهام");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDisplayName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.display_name || user?.email || 'مستخدم غير معروف';
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

          <div className="space-y-2">
            <Label htmlFor="manager_id" className="text-right block">مدير المشروع</Label>
            <Select 
              value={formData.manager_id} 
              onValueChange={(value) => handleSelectChange('manager_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر مدير المشروع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_manager" key="no_manager">بدون مدير</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.display_name || user.email || user.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

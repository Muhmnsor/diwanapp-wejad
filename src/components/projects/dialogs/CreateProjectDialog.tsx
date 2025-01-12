import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId: string;
  onSuccess?: () => void;
}

export const CreateProjectDialog = ({
  open,
  onOpenChange,
  portfolioId,
  onSuccess
}: CreateProjectDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
    status: "not_started",
    priority: "medium"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Creating new project with data:', formData);
      
      // Create project in Supabase
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([{
          title: formData.title,
          description: formData.description,
          start_date: formData.startDate,
          end_date: formData.dueDate,
          event_type: 'in-person',
          event_path: 'environment',
          event_category: 'social',
          max_attendees: 0,
          image_url: '/placeholder.svg'
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      // Link project to portfolio
      const { error: portfolioError } = await supabase
        .from('portfolio_projects')
        .insert([{
          portfolio_id: portfolioId,
          project_id: projectData.id,
          asana_status: formData.status,
          asana_priority: formData.priority
        }]);

      if (portfolioError) throw portfolioError;

      // Call Edge Function to create project in Asana
      const { error: asanaError } = await supabase.functions.invoke('create-asana-portfolio-project', {
        body: { 
          portfolioId,
          projectData: {
            ...formData,
            id: projectData.id
          }
        }
      });

      if (asanaError) throw asanaError;

      toast.success("تم إنشاء المشروع بنجاح");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("حدث خطأ أثناء إنشاء المشروع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إنشاء مشروع جديد</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>اسم المشروع</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="أدخل اسم المشروع"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>وصف المشروع</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="أدخل وصف المشروع"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>تاريخ البداية</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>تاريخ النهاية</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">لم يبدأ</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الأولوية</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الإنشاء..." : "إنشاء المشروع"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
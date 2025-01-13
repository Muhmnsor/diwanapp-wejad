import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreatePortfolioProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId: string;
  onSuccess?: () => void;
}

export const CreatePortfolioProjectDialog = ({
  open,
  onOpenChange,
  portfolioId,
  onSuccess
}: CreatePortfolioProjectDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    dueDate: "",
    status: "not_started",
    privacy: "private",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Creating portfolio project with data:', formData);
      
      // First get the portfolio's Asana GID
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('asana_gid')
        .eq('id', portfolioId)
        .maybeSingle();

      if (portfolioError) {
        console.error('Error fetching portfolio:', portfolioError);
        throw new Error('خطأ في جلب بيانات المحفظة');
      }

      if (!portfolioData?.asana_gid) {
        console.error('Portfolio has no Asana GID:', portfolioId);
        throw new Error('المحفظة غير مرتبطة بمنصة Asana');
      }

      console.log('Found portfolio Asana GID:', portfolioData.asana_gid);

      // Create the project in Asana first
      const { data: asanaData, error: asanaError } = await supabase.functions.invoke('create-asana-project', {
        body: {
          portfolioGid: portfolioData.asana_gid,
          name: formData.name,
          description: formData.description,
          startDate: formData.startDate || null,
          dueDate: formData.dueDate || null,
          status: formData.status,
          public: formData.privacy === 'public'
        }
      });

      if (asanaError) {
        console.error('Error creating Asana project:', asanaError);
        throw new Error('حدث خطأ أثناء إنشاء المشروع في منصة Asana');
      }

      console.log('Successfully created Asana project:', asanaData);

      // Create the portfolio project directly in portfolio_only_projects
      const { data: projectData, error: projectError } = await supabase
        .from('portfolio_only_projects')
        .insert([{
          name: formData.name,
          description: formData.description,
          start_date: formData.startDate || null,
          due_date: formData.dueDate || null,
          status: formData.status,
          privacy: formData.privacy,
          portfolio_id: portfolioId,
          asana_gid: asanaData.gid
        }])
        .select()
        .single();

      if (projectError) {
        console.error('Error creating portfolio project:', projectError);
        throw projectError;
      }

      console.log('Successfully created portfolio project:', projectData);

      toast.success("تم إنشاء المشروع بنجاح");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error in project creation:', error);
      toast.error(error.message || "حدث خطأ أثناء إنشاء المشروع");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إنشاء مشروع جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium block mb-1">
              اسم المشروع <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="أدخل اسم المشروع"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">الوصف</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="أدخل وصف المشروع"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">تاريخ البدء</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">تاريخ الانتهاء</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">الحالة</label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر حالة المشروع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">لم يبدأ</SelectItem>
                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">الخصوصية</label>
            <Select
              value={formData.privacy}
              onValueChange={(value) => setFormData({ ...formData, privacy: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر مستوى الخصوصية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">خاص</SelectItem>
                <SelectItem value="public">عام</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الإنشاء..." : "إنشاء المشروع"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ApplicationDialog = ({ isOpen, onClose, onSave }: ApplicationDialogProps) => {
  const [name, setName] = useState("إدارة الأفكار");
  const [description, setDescription] = useState("تطبيق لإدارة الأفكار والمقترحات ومتابعتها");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("الرجاء إدخال اسم التطبيق");
      return;
    }

    setIsLoading(true);
    try {
      // إضافة تطبيق جديد
      const { error } = await supabase
        .from('applications')
        .insert([{ name, description }]);

      if (error) throw error;

      // تسجيل نشاط المستخدم
      await supabase.rpc('log_user_activity', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        activity_type: 'application_create',
        details: `تم إنشاء تطبيق جديد: ${name}`
      });

      toast.success("تم إضافة التطبيق بنجاح");
      onSave();
    } catch (error) {
      console.error("Error saving application:", error);
      toast.error("حدث خطأ أثناء حفظ التطبيق");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة تطبيق جديد</DialogTitle>
          <DialogDescription>
            أدخل معلومات التطبيق الجديد أدناه
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم التطبيق</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: إدارة الأفكار"
                required
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">وصف التطبيق</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر للتطبيق والوظائف المرتبطة به"
                rows={3}
                className="text-right"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start flex-row-reverse">
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? "جار الحفظ..." : "حفظ"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

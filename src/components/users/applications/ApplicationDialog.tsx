
import { useState, useEffect } from "react";
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
import { Application } from "../types";

interface ApplicationDialogProps {
  isOpen: boolean;
  application: Application | null;
  onClose: () => void;
  onSave: () => void;
}

export const ApplicationDialog = ({ isOpen, application, onClose, onSave }: ApplicationDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (application) {
      setName(application.name);
      setDescription(application.description || "");
      setCode(application.code);
    } else {
      setName("");
      setDescription("");
      setCode("");
    }
  }, [application, isOpen]);

  const handleCodeChange = (value: string) => {
    // تحويل النص إلى تنسيق مناسب لاستخدامه كرمز (snake_case)
    const formattedCode = value
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    setCode(formattedCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !code) {
      toast.error("الرجاء إدخال اسم التطبيق ورمزه");
      return;
    }

    setIsSubmitting(true);
    try {
      // التحقق من عدم تكرار الرمز
      if (!application) {
        const { data, error: checkError } = await supabase
          .from('applications')
          .select('id')
          .eq('code', code)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        if (data) {
          toast.error("رمز التطبيق مستخدم بالفعل، الرجاء اختيار رمز آخر");
          return;
        }
      }
      
      if (application) {
        // تحديث تطبيق موجود
        const { error } = await supabase
          .from('applications')
          .update({ name, description, code })
          .eq('id', application.id);

        if (error) throw error;
      } else {
        // إضافة تطبيق جديد
        const { error } = await supabase
          .from('applications')
          .insert([{ name, description, code }]);

        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error("خطأ في حفظ التطبيق:", error);
      toast.error("حدث خطأ أثناء حفظ التطبيق");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{application ? "تعديل تطبيق" : "إضافة تطبيق جديد"}</DialogTitle>
          <DialogDescription>
            {application ? "قم بتعديل معلومات التطبيق أدناه" : "أدخل معلومات التطبيق الجديد أدناه"}
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
                placeholder="مثال: إدارة المستخدمين"
                required
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">رمز التطبيق (بالإنجليزية)</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="مثال: users_management"
                required
                className="text-left font-mono"
                disabled={application !== null} // لا يمكن تغيير الرمز للتطبيقات الموجودة
              />
              <p className="text-sm text-muted-foreground">
                يجب أن يحتوي الرمز على أحرف إنجليزية صغيرة وأرقام وشرطة سفلية فقط
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">وصف التطبيق</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر للتطبيق والغرض منه"
                rows={3}
                className="text-right"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start flex-row-reverse">
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "جار الحفظ..." : "حفظ"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

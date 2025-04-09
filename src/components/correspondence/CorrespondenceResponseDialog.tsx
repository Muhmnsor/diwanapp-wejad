import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useCorrespondence } from "@/hooks/useCorrespondence";
import { supabase } from "@/integrations/supabase/client";

interface CorrespondenceResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  distributionId: string;
  correspondenceId: string;
}

export const CorrespondenceResponseDialog: React.FC<CorrespondenceResponseDialogProps> = ({
  isOpen,
  onClose,
  distributionId,
  correspondenceId,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { addToHistory } = useCorrespondence();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const responseText = formData.get('response_text') as string;
      
      // تحديث حالة التوزيع
      const { error } = await supabase
        .from('correspondence_distribution')
        .update({
          response_text: responseText,
          response_date: new Date().toISOString(),
          status: 'مكتمل'
        })
        .eq('id', distributionId);
        
      if (error) throw error;
      
      // إضافة إلى سجل التاريخ
      await addToHistory(
        correspondenceId,
        'الرد على المعاملة',
        undefined, // يمكن استبدالها بمعرف المستخدم الحالي
        `تم الرد على المعاملة الموزعة`
      );
      
      toast({
        title: "تم إرسال الرد بنجاح",
        description: "تم حفظ الرد على المعاملة"
      });
      
      onClose();
    } catch (error) {
      console.error("Error responding to distribution:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إرسال الرد",
        description: "حدث خطأ أثناء إرسال الرد، يرجى المحاولة مرة أخرى"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>الرد على المعاملة</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="response_text">نص الرد</Label>
            <Textarea 
              id="response_text" 
              name="response_text" 
              placeholder="أدخل الرد على المعاملة" 
              rows={5}
              required
            />
          </div>
          
          <DialogFooter className="mt-6 gap-2 sm:justify-start">
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الإرسال...' : 'إرسال الرد'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


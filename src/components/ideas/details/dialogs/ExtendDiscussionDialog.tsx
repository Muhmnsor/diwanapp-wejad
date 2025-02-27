
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ExtendDiscussionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  onSuccess: () => void;
}

export const ExtendDiscussionDialog = ({
  isOpen,
  onClose,
  ideaId,
  onSuccess,
}: ExtendDiscussionDialogProps) => {
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (days === 0 && hours === 0) {
      toast.error("يرجى تحديد وقت إضافي للتمديد");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // الحصول على فترة المناقشة الحالية
      const { data: ideaData, error: fetchError } = await supabase
        .from("ideas")
        .select("discussion_period")
        .eq("id", ideaId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      let currentDays = 0;
      let currentHours = 0;
      
      // تحليل فترة المناقشة الحالية
      if (ideaData.discussion_period) {
        const parts = ideaData.discussion_period.split(' ');
        for (let i = 0; i < parts.length; i++) {
          if (parts[i] === 'days' && i > 0) {
            currentDays = parseInt(parts[i-1]) || 0;
          }
          if (parts[i] === 'hours' && i > 0) {
            currentHours = parseInt(parts[i-1]) || 0;
          }
        }
      }

      // إضافة الوقت الإضافي
      const newDays = currentDays + days;
      const newHours = currentHours + hours;
      
      // تنسيق فترة المناقشة الجديدة
      const newDiscussionPeriod = `${newDays} days ${newHours} hours`;

      // تحديث فترة المناقشة في قاعدة البيانات
      const { error: updateError } = await supabase
        .from("ideas")
        .update({ discussion_period: newDiscussionPeriod })
        .eq("id", ideaId);

      if (updateError) {
        throw updateError;
      }

      toast.success("تم تمديد فترة المناقشة بنجاح");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error extending discussion period:", error);
      toast.error("حدث خطأ أثناء تمديد فترة المناقشة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">تمديد فترة المناقشة</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="days" className="text-right col-span-1">الأيام</Label>
              <Input
                id="days"
                type="number"
                min="0"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hours" className="text-right col-span-1">الساعات</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (days === 0 && hours === 0)}
            >
              {isSubmitting ? "جاري التمديد..." : "تمديد"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { calculateTimeRemaining } from "../utils/countdownUtils";

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
  const [remainingDays, setRemainingDays] = useState<number>(0);
  const [remainingHours, setRemainingHours] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // استرجاع معلومات الفكرة والوقت المتبقي عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      const fetchIdeaDetails = async () => {
        setIsLoading(true);
        try {
          const { data: ideaData, error: fetchError } = await supabase
            .from("ideas")
            .select("discussion_period, created_at")
            .eq("id", ideaId)
            .single();

          if (fetchError) {
            throw fetchError;
          }

          console.log("Idea data fetched:", ideaData);

          if (ideaData) {
            // حساب الوقت المتبقي
            const { discussion_period, created_at } = ideaData;
            
            if (discussion_period && created_at) {
              console.log("Discussion period from DB:", discussion_period);
              console.log("Created at from DB:", created_at);
              
              // حساب الوقت المتبقي بالساعات
              const timeRemaining = calculateTimeRemaining(discussion_period, created_at);
              
              // تحويل الوقت المتبقي إلى أيام وساعات
              const totalHoursRemaining = 
                (timeRemaining.days * 24) + 
                timeRemaining.hours + 
                (timeRemaining.minutes / 60) + 
                (timeRemaining.seconds / 3600);
              
              const remaining_days = Math.floor(totalHoursRemaining / 24);
              const remaining_hours = Math.floor(totalHoursRemaining % 24);
              
              console.log("Calculated remaining time:", { days: remaining_days, hours: remaining_hours });
              
              setRemainingDays(remaining_days);
              setRemainingHours(remaining_hours);
              
              // ضبط القيم الافتراضية في حقول الإدخال لتكون نفس القيم المتبقية
              setDays(remaining_days);
              setHours(remaining_hours);
            }
          }
        } catch (error) {
          console.error("Error fetching idea details:", error);
          toast.error("حدث خطأ أثناء تحميل بيانات الفكرة");
        } finally {
          setIsLoading(false);
        }
      };

      fetchIdeaDetails();
    }
  }, [isOpen, ideaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (days === 0 && hours === 0) {
      toast.error("يرجى تحديد وقت إضافي للتمديد");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // تنسيق فترة المناقشة الجديدة - التأكد من أن التنسيق يتطابق مع المتوقع
      // تحقق من أن days و hours هي أرقام صحيحة وموجبة
      const finalDays = Math.max(0, Math.floor(days));
      const finalHours = Math.max(0, Math.floor(hours));
      
      // صياغة فترة المناقشة بالشكل الصحيح
      const daysText = finalDays === 1 ? "day" : "days";
      const hoursText = finalHours === 1 ? "hour" : "hours";
      
      let newDiscussionPeriod = "";
      if (finalDays > 0) {
        newDiscussionPeriod += `${finalDays} ${daysText}`;
      }
      if (finalHours > 0) {
        if (newDiscussionPeriod) newDiscussionPeriod += " ";
        newDiscussionPeriod += `${finalHours} ${hoursText}`;
      }
      
      // إذا كانت الفترة فارغة (حالة خاصة) نضع قيمة افتراضية
      if (!newDiscussionPeriod) {
        newDiscussionPeriod = "0 days";
      }

      console.log("Submitting new discussion period:", newDiscussionPeriod);

      // تحديث فترة المناقشة في قاعدة البيانات
      const { error: updateError } = await supabase
        .from("ideas")
        .update({ discussion_period: newDiscussionPeriod })
        .eq("id", ideaId);

      if (updateError) {
        throw updateError;
      }

      console.log("Discussion period updated successfully");
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
        
        {isLoading ? (
          <div className="py-4 text-center">جاري تحميل البيانات...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {(remainingDays > 0 || remainingHours > 0) && (
              <div className="mb-4 p-3 bg-purple-50 rounded-md">
                <p className="text-sm text-purple-700">
                  الوقت المتبقي حالياً: {remainingDays > 0 ? `${remainingDays} يوم` : ""} 
                  {remainingDays > 0 && remainingHours > 0 ? " و " : ""}
                  {remainingHours > 0 ? `${remainingHours} ساعة` : ""}
                </p>
              </div>
            )}
            
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
        )}
      </DialogContent>
    </Dialog>
  );
};

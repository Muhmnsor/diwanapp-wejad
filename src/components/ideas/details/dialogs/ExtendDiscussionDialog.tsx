
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { calculateTimeRemaining } from "../utils/countdownUtils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  const [operation, setOperation] = useState<string>("add");
  const [totalCurrentHours, setTotalCurrentHours] = useState<number>(0);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [discussionEnded, setDiscussionEnded] = useState(false);
  
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
              
              // التحقق مما إذا كانت المناقشة منتهية بالفعل (صفر ساعات)
              if (discussion_period === "0 hours") {
                setDiscussionEnded(true);
                setTotalCurrentHours(0);
                setRemainingDays(0);
                setRemainingHours(0);
              } else {
                setDiscussionEnded(false);
                
                // حساب إجمالي الساعات الحالية
                let totalHours = 0;
                
                if (discussion_period.includes('hours') || discussion_period.includes('hour')) {
                  const match = discussion_period.match(/(\d+)\s+hour/);
                  if (match) {
                    totalHours = parseInt(match[1]);
                  }
                } else if (discussion_period.includes('days') || discussion_period.includes('day')) {
                  const match = discussion_period.match(/(\d+)\s+day/);
                  if (match) {
                    totalHours = parseInt(match[1]) * 24;
                  }
                } else {
                  totalHours = parseFloat(discussion_period);
                }
                
                setTotalCurrentHours(totalHours);
                
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
                console.log("Total current hours in period:", totalHours);
                
                setRemainingDays(remaining_days);
                setRemainingHours(remaining_hours);
                
                // تحقق إذا كان الوقت المتبقي صفر (المناقشة انتهت)
                if (totalHoursRemaining <= 0) {
                  setDiscussionEnded(true);
                }
                
                // إعداد القيم الأولية في حقول الإدخال بناءً على الوقت الحالي
                if (totalHours >= 24) {
                  const currentDays = Math.floor(totalHours / 24);
                  const currentHoursRemainder = totalHours % 24;
                  setDays(currentDays);
                  setHours(currentHoursRemainder);
                } else {
                  setDays(0);
                  setHours(totalHours);
                }
              }
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
      toast.error("يرجى تحديد وقت للتعديل");
      return;
    }
    
    if (operation === "subtract" && (days > remainingDays || (days === remainingDays && hours > remainingHours))) {
      toast.error("لا يمكن تنقيص وقت أكثر من الوقت المتبقي");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // حساب إجمالي الساعات المقدمة من المستخدم
      const userInputHours = (days * 24) + hours;
      
      // حساب الساعات الجديدة بناءً على نوع العملية
      let newTotalHours = 0;
      
      if (operation === "add") {
        // في حالة الإضافة، نضيف الساعات الجديدة إلى إجمالي الساعات الحالية
        newTotalHours = totalCurrentHours + userInputHours;
      } else {
        // في حالة التنقيص، نطرح الساعات من إجمالي الساعات الحالية
        newTotalHours = Math.max(0, totalCurrentHours - userInputHours);
      }

      console.log("Current total hours:", totalCurrentHours);
      console.log("User input hours:", userInputHours);
      console.log("Operation:", operation);
      console.log("New total hours:", newTotalHours);
      
      // صياغة فترة المناقشة الجديدة بالشكل الصحيح
      const finalDays = Math.floor(newTotalHours / 24);
      const finalHours = Math.floor(newTotalHours % 24);
      
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
        newDiscussionPeriod = "0 hours";
      }
      
      console.log("New discussion period:", newDiscussionPeriod);

      // تحديث قاعدة البيانات
      const { error: updateError } = await supabase
        .from("ideas")
        .update({ discussion_period: newDiscussionPeriod })
        .eq("id", ideaId);

      if (updateError) {
        throw updateError;
      }

      console.log("Discussion period updated successfully");
      toast.success(operation === "add" ? "تم تمديد فترة المناقشة بنجاح" : "تم تنقيص فترة المناقشة بنجاح");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error modifying discussion period:", error);
      toast.error("حدث خطأ أثناء تعديل فترة المناقشة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndDiscussion = async () => {
    setIsSubmitting(true);
    try {
      // تحديث فترة المناقشة إلى صفر ساعات لإنهائها
      const { error: updateError } = await supabase
        .from("ideas")
        .update({ discussion_period: "0 hours" })
        .eq("id", ideaId);

      if (updateError) {
        throw updateError;
      }

      console.log("Discussion ended successfully");
      toast.success("تم إنهاء المناقشة بنجاح");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error ending discussion:", error);
      toast.error("حدث خطأ أثناء إنهاء المناقشة");
    } finally {
      setIsSubmitting(false);
      setIsEndDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل فترة المناقشة</DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="py-4 text-center">جاري تحميل البيانات...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* عرض الوقت الحالي والمتبقي */}
                <div className="p-3 bg-purple-50 rounded-md space-y-2">
                  <p className="text-sm font-medium text-purple-800">
                    الفترة الكلية الحالية: {
                      discussionEnded ? "المناقشة منتهية" : 
                      Math.floor(totalCurrentHours / 24) > 0 ? `${Math.floor(totalCurrentHours / 24)} يوم` : "" 
                    } 
                    {!discussionEnded && Math.floor(totalCurrentHours / 24) > 0 && totalCurrentHours % 24 > 0 ? " و " : ""}
                    {!discussionEnded && totalCurrentHours % 24 > 0 ? `${Math.floor(totalCurrentHours % 24)} ساعة` : ""}
                    {totalCurrentHours === 0 && !discussionEnded && "غير محددة"}
                  </p>
                  
                  <p className="text-sm text-purple-700">
                    الوقت المتبقي حالياً: {
                      discussionEnded ? "المناقشة منتهية" :
                      remainingDays > 0 ? `${remainingDays} يوم` : ""
                    } 
                    {!discussionEnded && remainingDays > 0 && remainingHours > 0 ? " و " : ""}
                    {!discussionEnded && remainingHours > 0 ? `${remainingHours} ساعة` : ""}
                    {!discussionEnded && remainingDays === 0 && remainingHours === 0 && "أقل من ساعة"}
                  </p>
                </div>
                
                {/* اختيار نوع العملية (تمديد/تنقيص) */}
                <div className="space-y-2">
                  <Label>نوع العملية:</Label>
                  <RadioGroup
                    value={operation}
                    onValueChange={setOperation}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="add" id="add" />
                      <Label htmlFor="add">تمديد</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="subtract" id="subtract" />
                      <Label htmlFor="subtract">تنقيص</Label>
                    </div>
                  </RadioGroup>
                </div>
              
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
              </div>
              
              <DialogFooter className="sm:justify-between mt-6 flex-wrap gap-2">
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose} 
                    disabled={isSubmitting}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => setIsEndDialogOpen(true)} 
                    disabled={isSubmitting}
                  >
                    إنهاء المناقشة
                  </Button>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting || (days === 0 && hours === 0)}
                >
                  {isSubmitting ? "جاري التعديل..." : operation === "add" ? "تمديد" : "تنقيص"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد إنهاء المناقشة */}
      <AlertDialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إنهاء المناقشة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في إنهاء المناقشة؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-between">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndDiscussion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري الإنهاء..." : "إنهاء المناقشة"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

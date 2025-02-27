
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ModifyTimeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  currentPeriod?: string;
}

export const ModifyTimeDialog = ({
  isOpen,
  onClose,
  ideaId,
  currentPeriod,
}: ModifyTimeDialogProps) => {
  const [time, setTime] = useState<number>(0);
  const [unit, setUnit] = useState<string>("hours");
  const [operation, setOperation] = useState<string>("add");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentHours, setCurrentHours] = useState<number>(0);
  const queryClient = useQueryClient();

  // جلب الوقت الحالي عند فتح النافذة
  useEffect(() => {
    if (isOpen && currentPeriod) {
      let hours = 0;
      
      // تفسير الوقت الحالي
      if (currentPeriod.includes('hours') || currentPeriod.includes('hour')) {
        const match = currentPeriod.match(/(\d+)\s+hour/);
        if (match) {
          hours = parseInt(match[1]);
        }
      } else if (currentPeriod.includes('days') || currentPeriod.includes('day')) {
        const match = currentPeriod.match(/(\d+)\s+day/);
        if (match) {
          hours = parseInt(match[1]) * 24;
        }
      } else {
        hours = parseFloat(currentPeriod);
      }
      
      setCurrentHours(hours);
      
      // تحديد الوحدة المناسبة للعرض
      if (hours >= 24 && hours % 24 === 0) {
        setUnit("days");
        setTime(hours / 24);
      } else if (hours < 1) {
        setUnit("minutes");
        setTime(Math.round(hours * 60));
      } else {
        setUnit("hours");
        setTime(hours);
      }
    }
  }, [isOpen, currentPeriod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (time <= 0) {
      toast.error("يجب أن يكون الوقت أكبر من صفر");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // تحويل الوقت إلى ساعات
      let hoursToModify = time;
      if (unit === "days") {
        hoursToModify = time * 24;
      } else if (unit === "minutes") {
        hoursToModify = time / 60;
      }
      
      // حساب الوقت الجديد
      let newHours = 0;
      
      if (operation === "add") {
        newHours = currentHours + hoursToModify;
      } else {
        newHours = Math.max(0, currentHours - hoursToModify);
      }
      
      // تحديث قاعدة البيانات
      const { error: updateError } = await supabase
        .from("ideas")
        .update({ discussion_period: `${newHours}` })
        .eq("id", ideaId);
      
      if (updateError) {
        throw updateError;
      }
      
      // تحديث الواجهة
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      queryClient.invalidateQueries({ queryKey: ["idea", ideaId] });
      
      toast.success(operation === "add" 
        ? "تم تمديد وقت المناقشة بنجاح" 
        : "تم تنقيص وقت المناقشة بنجاح"
      );
      
      onClose();
    } catch (error) {
      console.error("Error modifying discussion time:", error);
      toast.error("حدث خطأ أثناء تعديل وقت المناقشة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">تعديل وقت المناقشة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          <div className="space-y-4">
            {/* عرض الوقت الحالي */}
            <div className="space-y-2 bg-purple-50 p-3 rounded-md">
              <Label>الوقت الحالي للمناقشة:</Label>
              <div className="font-medium text-purple-800">
                {currentHours >= 24 && currentHours % 24 === 0 ? (
                  `${currentHours / 24} يوم`
                ) : currentHours < 1 ? (
                  `${Math.round(currentHours * 60)} دقيقة`
                ) : (
                  `${currentHours} ساعة`
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="operation">نوع العملية:</Label>
              <RadioGroup
                id="operation"
                value={operation}
                onValueChange={setOperation}
                className="flex space-x-2 space-x-reverse"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="add" id="add" />
                  <Label htmlFor="add">تمديد</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="subtract" id="subtract" />
                  <Label htmlFor="subtract">تنقيص</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">الوقت:</Label>
              <Input
                id="time"
                type="number"
                min="1"
                max="999"
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
                required
                className="text-right"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">الوحدة:</Label>
              <RadioGroup
                id="unit"
                value={unit}
                onValueChange={setUnit}
                className="flex space-x-2 space-x-reverse"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="minutes" id="minutes" />
                  <Label htmlFor="minutes">دقائق</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="hours" id="hours" />
                  <Label htmlFor="hours">ساعات</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="days" id="days" />
                  <Label htmlFor="days">أيام</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جارٍ التعديل..." : "تعديل الوقت"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

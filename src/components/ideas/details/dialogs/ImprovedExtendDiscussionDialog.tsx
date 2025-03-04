
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ImprovedExtendDiscussionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  onSuccess: () => void;
  currentDiscussionPeriod?: string;
}

export const ImprovedExtendDiscussionDialog = ({
  isOpen,
  onClose,
  ideaId,
  onSuccess,
  currentDiscussionPeriod
}: ImprovedExtendDiscussionDialogProps) => {
  const [extensionAmount, setExtensionAmount] = useState("24");
  const [timeUnit, setTimeUnit] = useState("hours");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExtend = async () => {
    if (!ideaId) {
      toast.error("معرف الفكرة غير صالح");
      return;
    }

    setIsSubmitting(true);
    console.log("🔄 بدء عملية تمديد المناقشة...");
    console.log(`📝 المدخلات: ${extensionAmount} ${timeUnit}`);
    console.log(`📝 معرف الفكرة: ${ideaId}`);
    console.log(`📝 فترة المناقشة الحالية: ${currentDiscussionPeriod || "غير محددة"}`);

    try {
      // 1. أولاً، جلب معلومات الفكرة الحالية للتأكد من آخر تحديث لها
      const { data: ideaData, error: fetchError } = await supabase
        .from("ideas")
        .select("discussion_period, status")
        .eq("id", ideaId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      console.log("📊 بيانات الفكرة المسترجعة:", ideaData);

      // 2. حساب فترة المناقشة الجديدة بإضافة الوقت الجديد إلى الوقت الحالي
      let newDiscussionPeriod = "";
      const currentPeriod = ideaData.discussion_period || "0 hours";
      
      // تحليل الفترة الحالية
      let currentHours = 0;
      
      // استخراج الساعات من الصيغة الحالية
      if (currentPeriod.includes('hours') || currentPeriod.includes('hour')) {
        const hoursMatch = currentPeriod.match(/(\d+)\s+hours?/i);
        if (hoursMatch && hoursMatch[1]) {
          currentHours += parseInt(hoursMatch[1]);
        }
      }
      
      if (currentPeriod.includes('days') || currentPeriod.includes('day')) {
        const daysMatch = currentPeriod.match(/(\d+)\s+days?/i);
        if (daysMatch && daysMatch[1]) {
          currentHours += parseInt(daysMatch[1]) * 24; // تحويل الأيام إلى ساعات
        }
      }
      
      console.log(`🔢 الساعات الحالية المحسوبة: ${currentHours}`);

      // إضافة الوقت الجديد
      let additionalHours = parseInt(extensionAmount);
      if (timeUnit === "days") {
        additionalHours *= 24; // تحويل الأيام إلى ساعات
      }
      
      const totalHours = currentHours + additionalHours;
      console.log(`➕ الساعات الإضافية: ${additionalHours}`);
      console.log(`🔢 إجمالي الساعات بعد الإضافة: ${totalHours}`);
      
      // تحويل إلى تنسيق النص المناسب
      if (totalHours >= 24 && totalHours % 24 === 0) {
        // إذا كان العدد ساعات قابلة للقسمة على 24، نعرضها كأيام
        const days = totalHours / 24;
        newDiscussionPeriod = `${days} ${days === 1 ? 'day' : 'days'}`;
      } else if (totalHours >= 24) {
        // إذا كان هناك أيام وساعات
        const days = Math.floor(totalHours / 24);
        const remainingHours = totalHours % 24;
        
        newDiscussionPeriod = `${days} ${days === 1 ? 'day' : 'days'}`;
        if (remainingHours > 0) {
          newDiscussionPeriod += ` ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`;
        }
      } else {
        // إذا كان أقل من يوم نعرضها كساعات
        newDiscussionPeriod = `${totalHours} ${totalHours === 1 ? 'hour' : 'hours'}`;
      }
      
      console.log(`🔄 فترة المناقشة الجديدة: ${newDiscussionPeriod}`);
      
      // 3. إذا كانت الفكرة في حالة "pending_decision"، نعيدها إلى "under_review"
      let newStatus = ideaData.status;
      if (ideaData.status === "pending_decision") {
        newStatus = "under_review";
        console.log("🔄 تغيير حالة الفكرة من pending_decision إلى under_review");
      }

      // 4. تحديث الفكرة في قاعدة البيانات
      const { error: updateError } = await supabase
        .from("ideas")
        .update({ 
          discussion_period: newDiscussionPeriod,
          status: newStatus
        })
        .eq("id", ideaId);

      if (updateError) {
        throw updateError;
      }

      console.log("✅ تم تحديث فترة المناقشة بنجاح!");
      toast.success("تم تمديد فترة المناقشة بنجاح");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("❌ خطأ أثناء تمديد المناقشة:", error);
      toast.error("حدث خطأ أثناء تمديد المناقشة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">تمديد فترة المناقشة</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-period" className="block">فترة المناقشة الحالية</Label>
            <Input 
              id="current-period" 
              value={currentDiscussionPeriod || "غير محددة"} 
              disabled 
              className="bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="extension-amount" className="block">مدة التمديد</Label>
              <Input
                id="extension-amount"
                type="number"
                min="1"
                value={extensionAmount}
                onChange={(e) => setExtensionAmount(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time-unit" className="block">الوحدة</Label>
              <Select 
                value={timeUnit} 
                onValueChange={(value) => setTimeUnit(value)}
              >
                <SelectTrigger id="time-unit" className="w-full">
                  <SelectValue placeholder="اختر الوحدة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">ساعات</SelectItem>
                  <SelectItem value="days">أيام</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="mt-2 sm:mt-0"
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleExtend} 
            disabled={isSubmitting}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSubmitting ? "جاري التمديد..." : "تمديد المناقشة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


import { useState } from "react";
import { IdeaCountdown } from "./components/IdeaCountdown";
import { StatusBadge } from "./components/StatusBadge";
import { ExtendButton } from "./components/ExtendButton";
import { ImprovedExtendDiscussionDialog } from "./dialogs/ImprovedExtendDiscussionDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IdeaMetadataProps {
  id: string;
  created_by: string;
  created_at: string;
  status: string;
  title: string;
  discussion_period?: string;
}

export const IdeaMetadata = ({
  id,
  created_by,
  created_at,
  status,
  title,
  discussion_period
}: IdeaMetadataProps) => {
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [localDiscussionPeriod, setLocalDiscussionPeriod] = useState(discussion_period);
  
  const handleExtendDialogOpen = () => {
    setIsExtendDialogOpen(true);
  };
  
  const handleExtendDialogClose = () => {
    setIsExtendDialogOpen(false);
  };
  
  const handleExtendSuccess = async (extendedPeriod: string) => {
    console.log("تم استلام فترة التمديد الجديدة:", extendedPeriod);
    
    try {
      // تحديث الفكرة في قاعدة البيانات مباشرة هنا
      const { error } = await supabase
        .from('ideas')
        .update({ discussion_period: extendedPeriod })
        .eq('id', id);
        
      if (error) {
        console.error("خطأ في تحديث فترة المناقشة:", error);
        toast.error("حدث خطأ أثناء تمديد فترة المناقشة");
        throw error;
      }
      
      // تحديث الحالة المحلية عند النجاح
      setLocalDiscussionPeriod(extendedPeriod);
      console.log("تم تمديد فترة المناقشة بنجاح إلى:", extendedPeriod);
      toast.success("تم تمديد فترة المناقشة بنجاح");
    } catch (error) {
      console.error("خطأ غير متوقع:", error);
      toast.error("حدث خطأ غير متوقع");
    }
  };
  
  // استخدام الفترة المحلية إذا كانت متاحة، وإلا استخدام الفترة الأصلية
  const currentDiscussionPeriod = localDiscussionPeriod || discussion_period;
  
  return <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-purple-100 my-[7px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <h1 className="text-lg sm:text-xl font-bold text-purple-800 truncate">{title}</h1>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <IdeaCountdown discussion_period={currentDiscussionPeriod} created_at={created_at} ideaId={id} />
          <ExtendButton onClick={handleExtendDialogOpen} />
          <StatusBadge 
            status={status} 
            ideaId={id} 
            discussionPeriod={currentDiscussionPeriod}
            createdAt={created_at}
          />
        </div>
      </div>
      
      {isExtendDialogOpen && (
        <ExtendDialog 
          isOpen={isExtendDialogOpen} 
          onClose={handleExtendDialogClose} 
          ideaId={id} 
          onSuccess={handleExtendSuccess} 
          currentDiscussionPeriod={currentDiscussionPeriod}
        />
      )}
    </div>;
};

// مكون الحوار المضمن لتجنب مشاكل التعديل على ملفات غير مسموح بها
const ExtendDialog = ({ 
  isOpen, 
  onClose, 
  ideaId, 
  onSuccess, 
  currentDiscussionPeriod 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  ideaId: string; 
  onSuccess: (extendedPeriod: string) => void; 
  currentDiscussionPeriod?: string; 
}) => {
  const [extendTime, setExtendTime] = useState('24');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // وظيفة لتحويل وقت المناقشة من النص إلى دقائق
  const convertPeriodToMinutes = (period?: string): number => {
    if (!period) return 0;
    
    console.log("تحويل فترة المناقشة:", period);
    
    try {
      // تحويل التنسيق 1d 6h إلى دقائق
      const days = period.includes('d') 
        ? parseInt(period.split('d')[0].trim(), 10) 
        : 0;
        
      const hoursPart = period.includes('d') 
        ? period.split('d')[1] 
        : period;
        
      const hours = hoursPart.includes('h') 
        ? parseInt(hoursPart.split('h')[0].trim(), 10) 
        : 0;
      
      const totalMinutes = (days * 24 * 60) + (hours * 60);
      console.log(`تحويل "${period}" إلى ${totalMinutes} دقيقة`);
      
      return totalMinutes;
    } catch (error) {
      console.error("خطأ في تحويل الوقت:", error);
      return 0;
    }
  };
  
  // وظيفة لتحويل الدقائق إلى تنسيق النص المطلوب
  const convertMinutesToPeriod = (minutes: number): string => {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    
    let periodText = '';
    if (days > 0) {
      periodText += `${days}d `;
    }
    if (hours > 0 || days === 0) {
      periodText += `${hours}h`;
    }
    
    return periodText.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log("بدء عملية تمديد المناقشة...");
    
    try {
      // جلب أحدث بيانات الفكرة أولاً
      const { data: ideaData, error: fetchError } = await supabase
        .from("ideas")
        .select("discussion_period")
        .eq("id", ideaId)
        .maybeSingle();
      
      if (fetchError) {
        console.error("خطأ في جلب بيانات الفكرة:", fetchError);
        throw fetchError;
      }
      
      console.log("بيانات الفكرة الحالية:", ideaData);
      
      // استخدام أحدث قيمة من قاعدة البيانات
      const latestPeriod = ideaData?.discussion_period || currentDiscussionPeriod;
      console.log("آخر فترة مناقشة:", latestPeriod);
      
      // تحويل الفترة الحالية إلى دقائق
      const currentMinutes = convertPeriodToMinutes(latestPeriod);
      console.log("الفترة الحالية بالدقائق:", currentMinutes);
      
      // إضافة الوقت الجديد (بالساعات) إلى الفترة الحالية
      const additionalMinutes = parseInt(extendTime, 10) * 60;
      const totalMinutes = currentMinutes + additionalMinutes;
      
      // تحويل الدقائق الكلية إلى التنسيق المطلوب
      const newPeriod = convertMinutesToPeriod(totalMinutes);
      console.log(`تمديد الوقت: إضافة ${extendTime} ساعة (${additionalMinutes} دقيقة) إلى ${currentMinutes} دقيقة = ${totalMinutes} دقيقة (${newPeriod})`);
      
      // إرسال النتيجة إلى الدالة الأصلية
      onSuccess(newPeriod);
      onClose();
    } catch (error) {
      console.error("خطأ في تمديد المناقشة:", error);
      toast.error("حدث خطأ أثناء تمديد فترة المناقشة");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" dir="rtl">
        <h2 className="text-xl font-bold mb-4 text-primary">تمديد فترة المناقشة</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              الفترة الحالية
            </label>
            <div className="p-2 bg-gray-50 border rounded-md">
              {currentDiscussionPeriod || "غير محدد"}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="extendTime" className="block text-sm font-medium mb-1">
              تمديد الوقت (بالساعات)
            </label>
            <select
              id="extendTime"
              value={extendTime}
              onChange={(e) => setExtendTime(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="24">24 ساعة (يوم)</option>
              <option value="48">48 ساعة (يومان)</option>
              <option value="72">72 ساعة (3 أيام)</option>
              <option value="168">168 ساعة (أسبوع)</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري التمديد..." : "تمديد"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

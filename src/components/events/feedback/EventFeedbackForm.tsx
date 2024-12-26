import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RatingInput } from "./RatingInput";
import { User, Phone } from "lucide-react";

interface EventFeedbackFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export const EventFeedbackForm = ({ eventId, onSuccess }: EventFeedbackFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [contentRating, setContentRating] = useState<number | null>(null);
  const [organizationRating, setOrganizationRating] = useState<number | null>(null);
  const [presenterRating, setPresenterRating] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('event_feedback')
        .insert({
          event_id: eventId,
          feedback_text: feedbackText,
          overall_rating: overallRating,
          content_rating: contentRating,
          organization_rating: organizationRating,
          presenter_rating: presenterRating,
          name: name || null,
          phone: phone || null,
        });

      if (error) throw error;

      toast.success("تم إرسال التقييم بنجاح");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error("حدث خطأ أثناء إرسال التقييم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            الاسم (اختياري)
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخل اسمك"
            className="bg-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Phone className="w-4 h-4" />
            رقم الجوال (اختياري)
          </label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="أدخل رقم جوالك"
            className="bg-white"
            type="tel"
          />
        </div>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-semibold text-lg mb-4">تقييم الفعالية</h3>
        <div className="space-y-6">
          <RatingInput
            label="التقييم العام"
            value={overallRating}
            onChange={setOverallRating}
            description="كيف كانت تجربتك الإجمالية مع الفعالية؟"
          />
          <RatingInput
            label="تقييم المحتوى"
            value={contentRating}
            onChange={setContentRating}
            description="هل كان محتوى الفعالية مفيداً وذا قيمة؟"
          />
          <RatingInput
            label="تقييم التنظيم"
            value={organizationRating}
            onChange={setOrganizationRating}
            description="كيف كانت جودة التنظيم والإدارة؟"
          />
          <RatingInput
            label="تقييم المقدم"
            value={presenterRating}
            onChange={setPresenterRating}
            description="كيف كانت مهارات وأداء المتحدث؟"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">ملاحظات إضافية</label>
        <Textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="اكتب ملاحظاتك هنا"
          className="h-32 bg-white"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
      </Button>
    </form>
  );
};
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RatingInput } from "./RatingInput";

interface EventFeedbackFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export const EventFeedbackForm = ({ eventId, onSuccess }: EventFeedbackFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
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
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div className="space-y-4">
        <RatingInput
          label="التقييم العام"
          value={overallRating}
          onChange={setOverallRating}
        />
        <RatingInput
          label="تقييم المحتوى"
          value={contentRating}
          onChange={setContentRating}
        />
        <RatingInput
          label="تقييم التنظيم"
          value={organizationRating}
          onChange={setOrganizationRating}
        />
        <RatingInput
          label="تقييم المقدم"
          value={presenterRating}
          onChange={setPresenterRating}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">ملاحظات إضافية</label>
        <Textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="اكتب ملاحظاتك هنا"
          className="h-32"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
      </Button>
    </form>
  );
};
import { useState } from "react";
import { EventFeedbackForm } from "../EventFeedbackForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface FeedbackFormContainerProps {
  eventId?: string;
}

export const FeedbackFormContainer = ({ eventId }: FeedbackFormContainerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  console.log('FeedbackFormContainer - Event ID:', eventId);

  if (!eventId) {
    return <div className="text-center">معرف الفعالية غير متوفر</div>;
  }

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting feedback for event:', eventId, formData);

      const { error } = await supabase
        .from('event_feedback')
        .insert([
          {
            event_id: eventId,
            name: formData.name,
            phone: formData.phone,
            overall_rating: formData.overallRating,
            content_rating: formData.contentRating,
            organization_rating: formData.organizationRating,
            presenter_rating: formData.presenterRating,
            feedback_text: formData.feedbackText
          }
        ]);

      if (error) throw error;

      toast.success('تم إرسال التقييم بنجاح');
      navigate(`/events/${eventId}`);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('حدث خطأ أثناء إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EventFeedbackForm 
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};
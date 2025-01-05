import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EventFeedbackForm } from "../EventFeedbackForm";

interface FeedbackFormContainerProps {
  eventId?: string;
}

export const FeedbackFormContainer = ({ eventId }: FeedbackFormContainerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const effectiveEventId = eventId || id;

  console.log('FeedbackFormContainer - Event ID:', effectiveEventId);

  if (!effectiveEventId) {
    return <div className="text-center">معرف الفعالية غير متوفر</div>;
  }

  const handleSubmit = async (formData: {
    overallRating: number | null;
    contentRating: number | null;
    organizationRating: number | null;
    presenterRating: number | null;
  }) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting feedback for event:', effectiveEventId, formData);

      const { error } = await supabase
        .from('event_feedback')
        .insert([
          {
            event_id: effectiveEventId,
            overall_rating: formData.overallRating,
            content_rating: formData.contentRating,
            organization_rating: formData.organizationRating,
            presenter_rating: formData.presenterRating
          }
        ]);

      if (error) throw error;

      toast.success('تم إرسال التقييم بنجاح');
      navigate(`/events/${effectiveEventId}`);
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
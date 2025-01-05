import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EventFeedbackForm } from "../EventFeedbackForm";
import { toast } from "sonner";

interface FeedbackFormContainerProps {
  eventId: string;
}

export const FeedbackFormContainer = ({ eventId }: FeedbackFormContainerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  console.log('FeedbackFormContainer - Initializing with eventId:', eventId);

  const handleSubmit = async (formData: any) => {
    console.log('Submitting feedback for event:', eventId, formData);
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('event_feedback')
        .insert([
          {
            event_id: eventId,
            overall_rating: formData.overallRating,
            content_rating: formData.contentRating,
            organization_rating: formData.organizationRating,
            presenter_rating: formData.presenterRating,
            feedback_text: formData.feedbackText,
            name: formData.name,
            phone: formData.phone,
          }
        ]);

      if (error) {
        console.error('Error submitting feedback:', error);
        toast.error('حدث خطأ في إرسال التقييم');
        return;
      }

      toast.success('تم إرسال التقييم بنجاح');
      navigate(`/events/${eventId}`);
    } catch (error) {
      console.error('Error in feedback submission:', error);
      toast.error('حدث خطأ في إرسال التقييم');
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
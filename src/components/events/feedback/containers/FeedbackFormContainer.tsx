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
  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [contentRating, setContentRating] = useState<number | null>(null);
  const [organizationRating, setOrganizationRating] = useState<number | null>(null);
  const [presenterRating, setPresenterRating] = useState<number | null>(null);
  const navigate = useNavigate();

  console.log('FeedbackFormContainer - Event ID:', eventId);

  if (!eventId) {
    return <div className="text-center">معرف الفعالية غير متوفر</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      console.log('Submitting feedback for event:', eventId, {
        overallRating,
        contentRating,
        organizationRating,
        presenterRating
      });

      const { error } = await supabase
        .from('event_feedback')
        .insert([
          {
            event_id: eventId,
            overall_rating: overallRating,
            content_rating: contentRating,
            organization_rating: organizationRating,
            presenter_rating: presenterRating
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
      overallRating={overallRating}
      contentRating={contentRating}
      organizationRating={organizationRating}
      presenterRating={presenterRating}
      onOverallRatingChange={setOverallRating}
      onContentRatingChange={setContentRating}
      onOrganizationRatingChange={setOrganizationRating}
      onPresenterRatingChange={setPresenterRating}
    />
  );
};
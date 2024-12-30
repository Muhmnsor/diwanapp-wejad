import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EventFeedbackForm } from "../EventFeedbackForm";

export const FeedbackFormContainer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [contentRating, setContentRating] = useState<number | null>(null);
  const [organizationRating, setOrganizationRating] = useState<number | null>(null);
  const [presenterRating, setPresenterRating] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { pathname } = window.location;
      const activityId = pathname.split('/')[2];

      const { error } = await supabase.from('event_feedback').insert({
        event_id: activityId,
        overall_rating: overallRating,
        content_rating: contentRating,
        organization_rating: organizationRating,
        presenter_rating: presenterRating,
      });

      if (error) throw error;

      toast.success('تم إرسال التقييم بنجاح');
      
      // Reset form after successful submission
      setOverallRating(null);
      setContentRating(null);
      setOrganizationRating(null);
      setPresenterRating(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('حدث خطأ أثناء إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EventFeedbackForm
      isSubmitting={isSubmitting}
      overallRating={overallRating}
      contentRating={contentRating}
      organizationRating={organizationRating}
      presenterRating={presenterRating}
      onOverallRatingChange={setOverallRating}
      onContentRatingChange={setContentRating}
      onOrganizationRatingChange={setOrganizationRating}
      onPresenterRatingChange={setPresenterRating}
      onSubmit={handleSubmit}
    />
  );
};
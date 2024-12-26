import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { EventFeedbackForm } from "../EventFeedbackForm";

export const FeedbackFormContainer = () => {
  const navigate = useNavigate();
  const { id: eventId } = useParams();
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
    
    if (!eventId) {
      toast.error("لم يتم العثور على معرف الفعالية");
      return;
    }

    if (!overallRating || !contentRating || !organizationRating || !presenterRating) {
      toast.error("الرجاء تقييم جميع العناصر");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting feedback for event:', eventId);
      
      const { error } = await supabase
        .from('event_feedback')
        .insert({
          event_id: eventId,
          feedback_text: feedbackText.trim(),
          overall_rating: overallRating,
          content_rating: contentRating,
          organization_rating: organizationRating,
          presenter_rating: presenterRating,
          name: name.trim() || null,
          phone: phone.trim() || null,
        });

      if (error) {
        console.error('Error submitting feedback:', error);
        throw error;
      }

      toast.success("تم إرسال التقييم بنجاح");
      navigate(`/event/${eventId}`);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error("حدث خطأ أثناء إرسال التقييم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EventFeedbackForm
      isSubmitting={isSubmitting}
      feedbackText={feedbackText}
      name={name}
      phone={phone}
      overallRating={overallRating}
      contentRating={contentRating}
      organizationRating={organizationRating}
      presenterRating={presenterRating}
      onFeedbackTextChange={setFeedbackText}
      onNameChange={setName}
      onPhoneChange={setPhone}
      onOverallRatingChange={setOverallRating}
      onContentRatingChange={setContentRating}
      onOrganizationRatingChange={setOrganizationRating}
      onPresenterRatingChange={setPresenterRating}
      onSubmit={handleSubmit}
    />
  );
};
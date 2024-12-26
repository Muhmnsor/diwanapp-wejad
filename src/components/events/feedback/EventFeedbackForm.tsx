import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { RatingsSection } from "./RatingsSection";
import { CommentsSection } from "./CommentsSection";

interface EventFeedbackFormProps {
  onSuccess?: () => void;
}

export const EventFeedbackForm = ({ onSuccess }: EventFeedbackFormProps) => {
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
      
      if (onSuccess) {
        onSuccess();
      }
      
      navigate(`/event/${eventId}`);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error("حدث خطأ أثناء إرسال التقييم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" dir="rtl">
      <RatingsSection
        overallRating={overallRating}
        contentRating={contentRating}
        organizationRating={organizationRating}
        presenterRating={presenterRating}
        onOverallRatingChange={setOverallRating}
        onContentRatingChange={setContentRating}
        onOrganizationRatingChange={setOrganizationRating}
        onPresenterRatingChange={setPresenterRating}
      />

      <PersonalInfoSection
        name={name}
        phone={phone}
        onNameChange={setName}
        onPhoneChange={setPhone}
      />

      <CommentsSection
        value={feedbackText}
        onChange={setFeedbackText}
      />

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
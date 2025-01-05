import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RatingsSection } from "./RatingsSection";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { CommentsSection } from "./CommentsSection";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EventFeedbackFormProps {
  eventId: string;
}

export const EventFeedbackForm = ({ eventId }: EventFeedbackFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [contentRating, setContentRating] = useState<number | null>(null);
  const [organizationRating, setOrganizationRating] = useState<number | null>(null);
  const [presenterRating, setPresenterRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  console.log('EventFeedbackForm - Rendering for event:', eventId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting feedback for event:', eventId);

    if (!overallRating) {
      toast.error("الرجاء تقديم التقييم العام على الأقل");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('event_feedback')
        .insert([
          {
            event_id: eventId,
            overall_rating: overallRating,
            content_rating: contentRating,
            organization_rating: organizationRating,
            presenter_rating: presenterRating,
            feedback_text: feedbackText,
            name: name || null,
            phone: phone || null,
          }
        ]);

      if (error) {
        console.error('Error submitting feedback:', error);
        toast.error('حدث خطأ في إرسال التقييم');
        return;
      }

      toast.success('تم إرسال التقييم بنجاح');
      // Reset form
      setOverallRating(null);
      setContentRating(null);
      setOrganizationRating(null);
      setPresenterRating(null);
      setFeedbackText("");
      setName("");
      setPhone("");
    } catch (error) {
      console.error('Error in feedback submission:', error);
      toast.error('حدث خطأ في إرسال التقييم');
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
        {isSubmitting ? "جاري الإرسال..." : "إرسال تقييم النشاط"}
      </Button>
    </form>
  );
};
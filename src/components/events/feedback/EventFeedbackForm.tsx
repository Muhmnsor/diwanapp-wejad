import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RatingsSection } from "./RatingsSection";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { CommentsSection } from "./CommentsSection";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EventFeedbackFormProps {
  eventId: string;
  isSubmitting: boolean;
  onSubmit: (formData: any) => Promise<void>;
}

export const EventFeedbackForm = ({
  eventId,
  isSubmitting,
  onSubmit
}: EventFeedbackFormProps) => {
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

    try {
      await onSubmit({
        overallRating,
        contentRating,
        organizationRating,
        presenterRating,
        feedbackText,
        name: name || null,
        phone: phone || null,
      });

      // Reset form after successful submission
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
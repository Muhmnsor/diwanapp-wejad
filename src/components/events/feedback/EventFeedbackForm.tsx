import { Button } from "@/components/ui/button";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { RatingsSection } from "./RatingsSection";
import { CommentsSection } from "./CommentsSection";

interface EventFeedbackFormProps {
  isSubmitting: boolean;
  feedbackText: string;
  name: string;
  phone: string;
  overallRating: number | null;
  contentRating: number | null;
  organizationRating: number | null;
  presenterRating: number | null;
  onFeedbackTextChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onOverallRatingChange: (value: number) => void;
  onContentRatingChange: (value: number) => void;
  onOrganizationRatingChange: (value: number) => void;
  onPresenterRatingChange: (value: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EventFeedbackForm = ({
  isSubmitting,
  feedbackText,
  name,
  phone,
  overallRating,
  contentRating,
  organizationRating,
  presenterRating,
  onFeedbackTextChange,
  onNameChange,
  onPhoneChange,
  onOverallRatingChange,
  onContentRatingChange,
  onOrganizationRatingChange,
  onPresenterRatingChange,
  onSubmit,
}: EventFeedbackFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8" dir="rtl">
      <RatingsSection
        overallRating={overallRating}
        contentRating={contentRating}
        organizationRating={organizationRating}
        presenterRating={presenterRating}
        onOverallRatingChange={onOverallRatingChange}
        onContentRatingChange={onContentRatingChange}
        onOrganizationRatingChange={onOrganizationRatingChange}
        onPresenterRatingChange={onPresenterRatingChange}
      />

      <PersonalInfoSection
        name={name}
        phone={phone}
        onNameChange={onNameChange}
        onPhoneChange={onPhoneChange}
      />

      <CommentsSection
        value={feedbackText}
        onChange={onFeedbackTextChange}
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
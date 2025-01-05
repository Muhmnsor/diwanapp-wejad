import { Button } from "@/components/ui/button";
import { RatingsSection } from "./RatingsSection";

interface EventFeedbackFormProps {
  isSubmitting: boolean;
  overallRating: number | null;
  contentRating: number | null;
  organizationRating: number | null;
  presenterRating: number | null;
  onOverallRatingChange: (value: number) => void;
  onContentRatingChange: (value: number) => void;
  onOrganizationRatingChange: (value: number) => void;
  onPresenterRatingChange: (value: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EventFeedbackForm = ({
  isSubmitting,
  overallRating,
  contentRating,
  organizationRating,
  presenterRating,
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
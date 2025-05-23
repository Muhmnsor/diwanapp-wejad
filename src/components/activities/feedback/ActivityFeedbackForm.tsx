import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RatingInput } from "@/components/events/feedback/RatingInput";
import { toast } from "sonner";

interface ActivityFeedbackFormProps {
  isSubmitting: boolean;
  onSubmit: (formData: {
    overallRating: number | null;
    contentRating: number | null;
    organizationRating: number | null;
    presenterRating: number | null;
  }) => void;
}

export const ActivityFeedbackForm = ({
  isSubmitting,
  onSubmit
}: ActivityFeedbackFormProps) => {
  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [contentRating, setContentRating] = useState<number | null>(null);
  const [organizationRating, setOrganizationRating] = useState<number | null>(null);
  const [presenterRating, setPresenterRating] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!overallRating) {
      toast.error('الرجاء إدخال التقييم العام');
      return;
    }

    onSubmit({
      overallRating,
      contentRating,
      organizationRating,
      presenterRating
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" dir="rtl">
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-semibold text-lg mb-4">تقييم النشاط</h3>
        <div className="space-y-6">
          <RatingInput
            label="التقييم العام"
            value={overallRating}
            onChange={setOverallRating}
            description="كيف كانت تجربتك الإجمالية مع النشاط؟"
          />
          <RatingInput
            label="تقييم المحتوى"
            value={contentRating}
            onChange={setContentRating}
            description="هل كان محتوى النشاط مفيداً وذا قيمة؟"
          />
          <RatingInput
            label="تقييم التنظيم"
            value={organizationRating}
            onChange={setOrganizationRating}
            description="كيف كانت جودة التنظيم والإدارة؟"
          />
          <RatingInput
            label="تقييم المقدم"
            value={presenterRating}
            onChange={setPresenterRating}
            description="كيف كانت مهارات وأداء المتحدث؟"
          />
        </div>
      </div>

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
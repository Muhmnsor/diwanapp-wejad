import { RatingInput } from "./RatingInput";

interface RatingsSectionProps {
  overallRating: number | null;
  contentRating: number | null;
  organizationRating: number | null;
  presenterRating: number | null;
  onOverallRatingChange: (value: number) => void;
  onContentRatingChange: (value: number) => void;
  onOrganizationRatingChange: (value: number) => void;
  onPresenterRatingChange: (value: number) => void;
}

export const RatingsSection = ({
  overallRating,
  contentRating,
  organizationRating,
  presenterRating,
  onOverallRatingChange,
  onContentRatingChange,
  onOrganizationRatingChange,
  onPresenterRatingChange,
}: RatingsSectionProps) => {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h3 className="font-semibold text-lg mb-4">تقييم النشاط</h3>
      <div className="space-y-6">
        <RatingInput
          label="التقييم العام"
          value={overallRating}
          onChange={onOverallRatingChange}
          description="كيف كانت تجربتك الإجمالية مع النشاط؟"
        />
        <RatingInput
          label="تقييم المحتوى"
          value={contentRating}
          onChange={onContentRatingChange}
          description="هل كان محتوى النشاط مفيداً وذا قيمة؟"
        />
        <RatingInput
          label="تقييم التنظيم"
          value={organizationRating}
          onChange={onOrganizationRatingChange}
          description="كيف كانت جودة التنظيم والإدارة؟"
        />
        <RatingInput
          label="تقييم المقدم"
          value={presenterRating}
          onChange={onPresenterRatingChange}
          description="كيف كانت مهارات وأداء المتحدث؟"
        />
      </div>
    </div>
  );
};
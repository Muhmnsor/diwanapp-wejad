import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isLastStep: boolean;
  template?: any;
}

export const StepNavigation = ({
  currentStep,
  onNext,
  onBack,
  onCancel,
  isLoading,
  isLastStep,
  template
}: StepNavigationProps) => {
  return (
    <div className="flex justify-between">
      <div>
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            السابق
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          إلغاء
        </Button>
        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={onNext}
            disabled={isLoading}
          >
            التالي
          </Button>
        ) : (
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'جاري الحفظ...' : template ? 'تحديث' : 'إضافة'}
          </Button>
        )}
      </div>
    </div>
  );
};
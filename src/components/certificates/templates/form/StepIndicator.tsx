interface StepIndicatorProps {
  currentStep: number;
  stepTitle: string;
}

export const StepIndicator = ({ currentStep, stepTitle }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === currentStep
                ? 'bg-primary text-primary-foreground'
                : step < currentStep
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {step}
          </div>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        {stepTitle} - الخطوة {currentStep} من 4
      </div>
    </div>
  );
};
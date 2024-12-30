import { Button } from "@/components/ui/button";

interface ProjectRegistrationActionsProps {
  isSubmitting: boolean;
  isPaidProject: boolean;
  projectPrice: number | "free" | null;
}

export const ProjectRegistrationActions = ({
  isSubmitting,
  isPaidProject,
  projectPrice
}: ProjectRegistrationActionsProps) => {
  const getButtonText = () => {
    if (isSubmitting) {
      return "جاري المعالجة...";
    }
    if (isPaidProject) {
      return `الدفع وتأكيد التسجيل (${projectPrice} ريال)`;
    }
    return "تأكيد التسجيل";
  };

  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isSubmitting}
    >
      {getButtonText()}
    </Button>
  );
};
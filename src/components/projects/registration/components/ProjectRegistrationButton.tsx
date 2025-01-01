import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ProjectRegistrationButtonProps {
  isSubmitting: boolean;
  isPaidProject: boolean;
  projectPrice: number | "free" | null;
}

export const ProjectRegistrationButton = ({
  isSubmitting,
  isPaidProject,
  projectPrice
}: ProjectRegistrationButtonProps) => {
  const buttonText = isSubmitting
    ? "جاري التسجيل..."
    : isPaidProject
    ? `تسجيل ودفع ${projectPrice} ريال`
    : "تأكيد التسجيل";

  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isSubmitting}
    >
      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {buttonText}
    </Button>
  );
};
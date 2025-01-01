import { Button } from "@/components/ui/button";

interface ProjectRegistrationButtonProps {
  isPaidProject: boolean;
  projectPrice: number | "free" | null;
}

export const ProjectRegistrationButton = ({
  isPaidProject,
  projectPrice
}: ProjectRegistrationButtonProps) => {
  const buttonText = isPaidProject 
    ? `الدفع وتأكيد التسجيل (${projectPrice} ريال)`
    : "تأكيد التسجيل";

  return (
    <Button 
      type="submit"
      className="w-full"
    >
      {buttonText}
    </Button>
  );
};
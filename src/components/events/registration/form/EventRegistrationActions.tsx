import { Button } from "@/components/ui/button";

interface EventRegistrationActionsProps {
  isSubmitting: boolean;
  isPaidProject: boolean;
  projectPrice: number | "free" | null;
}

export const EventRegistrationActions = ({
  isSubmitting,
  isPaidProject,
  projectPrice,
}: EventRegistrationActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 rtl:space-x-reverse">
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "جاري التسجيل..."
          : isPaidProject
          ? `تسجيل ودفع ${projectPrice} ريال`
          : "تسجيل"}
      </Button>
    </div>
  );
};
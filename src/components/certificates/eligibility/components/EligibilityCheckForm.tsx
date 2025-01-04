import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EligibilityCheckFormProps {
  onCheck: () => void;
  isLoading: boolean;
}

export const EligibilityCheckForm = ({
  onCheck,
  isLoading
}: EligibilityCheckFormProps) => {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={onCheck}
        disabled={isLoading}
        className="w-full md:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري التحقق...
          </>
        ) : (
          'التحقق من الأهلية'
        )}
      </Button>
    </div>
  );
};
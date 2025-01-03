import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EligibilityCheckFormProps {
  onCheck: () => void;
  isLoading: boolean;
}

export const EligibilityCheckForm = ({ onCheck, isLoading }: EligibilityCheckFormProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">التحقق من أهلية الشهادة</h2>
      <Button 
        onClick={onCheck} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري التحقق...
          </>
        ) : (
          "التحقق من الأهلية"
        )}
      </Button>
    </div>
  );
};

import { Progress } from "@/components/ui/progress";

interface CopyProgressIndicatorProps {
  progress: number;
  step: string;
  isLoading: boolean;
}

export const CopyProgressIndicator = ({
  progress,
  step,
  isLoading
}: CopyProgressIndicatorProps) => {
  if (!isLoading) return null;

  return (
    <div className="py-4 space-y-4">
      <div className="text-center text-sm font-medium text-blue-600">{step}</div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

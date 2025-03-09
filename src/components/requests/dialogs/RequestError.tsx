
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RequestErrorProps {
  error: string | null;
  showIcon?: boolean;
  retryAction?: () => void;
}

export const RequestError = ({ 
  error, 
  showIcon = true,
  retryAction
}: RequestErrorProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive">
      {showIcon && <AlertCircle className="h-4 w-4 ml-2" />}
      <AlertDescription>
        <div className="whitespace-pre-line">{error}</div>
        {retryAction && (
          <button 
            onClick={retryAction}
            className="mt-2 text-sm underline hover:text-destructive-foreground/80"
          >
            محاولة مرة أخرى
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
};

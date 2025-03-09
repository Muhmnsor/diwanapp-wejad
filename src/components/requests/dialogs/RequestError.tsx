
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RequestErrorProps {
  error: string | null;
  showIcon?: boolean;
}

export const RequestError = ({ error, showIcon = true }: RequestErrorProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive">
      {showIcon && <AlertCircle className="h-4 w-4 ml-2" />}
      <AlertDescription>
        <div className="whitespace-pre-line">{error}</div>
      </AlertDescription>
    </Alert>
  );
};

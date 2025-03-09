
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RequestErrorProps {
  error: string | null;
}

export const RequestError = ({ error }: RequestErrorProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4 ml-2" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

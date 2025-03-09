
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RequestsHeaderProps {
  title: string;
  error: string | null;
}

export const RequestsHeader = ({ title, error }: RequestsHeaderProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      
      {error && (
        <Alert variant="destructive" className="mb-4 mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

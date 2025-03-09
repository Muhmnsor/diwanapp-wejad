
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequestErrorProps {
  error: string | null;
  showIcon?: boolean;
  retryAction?: () => void;
  showDetails?: boolean;
}

export const RequestError = ({ 
  error, 
  showIcon = true,
  retryAction,
  showDetails = false
}: RequestErrorProps) => {
  if (!error) return null;
  
  // Check if error is a complex JSON string and try to parse it
  let errorMessage = error;
  let detailsMessage = '';
  
  try {
    if (error.includes('{') && error.includes('}')) {
      const jsonStart = error.indexOf('{');
      const jsonStr = error.substring(jsonStart);
      const errorObj = JSON.parse(jsonStr);
      
      if (errorObj.message) {
        errorMessage = errorObj.message;
      }
      
      if (errorObj.details) {
        detailsMessage = errorObj.details;
      }
    }
  } catch (e) {
    // If parsing fails, use the original error message
    console.log('Error parsing error message:', e);
  }
  
  return (
    <Alert variant="destructive" className="mb-4">
      <div className="flex items-start">
        {showIcon && <AlertCircle className="h-4 w-4 mt-1 ml-2" />}
        <div>
          <AlertTitle className="text-right mb-1 font-bold">خطأ في النظام</AlertTitle>
          <AlertDescription>
            <div className="whitespace-pre-line">{errorMessage}</div>
            
            {showDetails && detailsMessage && (
              <div className="mt-2 text-sm p-2 bg-red-50 rounded border border-red-200">
                <p className="font-semibold mb-1">تفاصيل الخطأ:</p>
                <pre className="whitespace-pre-wrap text-xs">{detailsMessage}</pre>
              </div>
            )}
            
            {retryAction && (
              <Button 
                onClick={retryAction}
                variant="outline"
                className="mt-2 text-sm hover:text-destructive-foreground/80"
              >
                محاولة مرة أخرى
              </Button>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};


import { Button } from "@/components/ui/button";
import { AlertCircle, Bug, CheckCircle2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuthStore } from "@/store/refactored-auth";

interface DiagnoseWorkflowButtonProps {
  requestId: string;
  onDiagnose: () => void;
  onFix: () => void;
  onSuccess?: () => void;
  isDiagnosing?: boolean;
  diagnosticResult?: any;
  className?: string;
}

export const DiagnoseWorkflowButton = ({
  requestId,
  onDiagnose,
  onFix,
  onSuccess,
  isDiagnosing = false,
  diagnosticResult,
  className
}: DiagnoseWorkflowButtonProps) => {
  const { user } = useAuthStore();
  
  // Only admins can use diagnostic tools
  if (!user?.isAdmin) {
    return null;
  }

  const handleFix = () => {
    onFix();
    if (onSuccess) {
      onSuccess();
    }
  };

  const hasIssues = diagnosticResult?.issues && diagnosticResult.issues.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={className}
          onClick={!diagnosticResult ? onDiagnose : undefined}
        >
          {isDiagnosing ? (
            <>جاري التشخيص</>
          ) : diagnosticResult ? (
            hasIssues ? (
              <><AlertCircle className="h-4 w-4 mr-1 text-red-500" /> تم العثور على مشاكل</>
            ) : (
              <><CheckCircle2 className="h-4 w-4 mr-1 text-green-500" /> لا توجد مشاكل</>
            )
          ) : (
            <><Bug className="h-4 w-4 mr-1" /> تشخيص</>
          )}
        </Button>
      </PopoverTrigger>
      
      {diagnosticResult && (
        <PopoverContent className="w-80 rtl">
          <div className="space-y-2">
            <h3 className="font-medium text-lg">نتائج التشخيص</h3>
            
            {hasIssues ? (
              <>
                <div className="text-sm text-red-500">
                  تم العثور على المشاكل التالية:
                </div>
                <ul className="text-sm space-y-1 list-disc mr-4">
                  {diagnosticResult.issues.map((issue: string, index: number) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
                
                <Button size="sm" onClick={handleFix} className="mt-2">
                  إصلاح المشاكل
                </Button>
              </>
            ) : (
              <div className="text-sm text-green-500">
                لا توجد مشاكل في سير العمل للطلب.
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-2 border-t pt-2">
              معرف الطلب: {requestId}
            </div>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};

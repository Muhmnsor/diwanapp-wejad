
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export interface DiagnoseWorkflowButtonProps {
  onDiagnose: () => Promise<any>;
  onFix: () => Promise<any>;
  onSuccess: () => Promise<void>;
  isDiagnosing: boolean;
  diagnosticResult: any;
  className?: string;
  requestId?: string; // Make requestId optional
}

export const DiagnoseWorkflowButton: React.FC<DiagnoseWorkflowButtonProps> = ({
  onDiagnose,
  onFix,
  onSuccess,
  isDiagnosing,
  diagnosticResult,
  className,
  requestId
}) => {
  const [isFixing, setIsFixing] = useState(false);

  const handleFix = async () => {
    try {
      setIsFixing(true);
      await onFix();
      await onSuccess();
      toast.success("تم إصلاح مشاكل سير العمل بنجاح");
    } catch (error) {
      console.error("Error fixing workflow:", error);
      toast.error("حدث خطأ أثناء محاولة إصلاح سير العمل");
    } finally {
      setIsFixing(false);
    }
  };

  const hasIssues = diagnosticResult?.issues && diagnosticResult.issues.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={className}
          disabled={isDiagnosing || isFixing}
        >
          {isDiagnosing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري الفحص...
            </>
          ) : hasIssues ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
              مشاكل في سير العمل
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              فحص سير العمل
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>خيارات التشخيص</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDiagnose()} disabled={isDiagnosing}>
          فحص سير العمل
        </DropdownMenuItem>
        {hasIssues && (
          <DropdownMenuItem onClick={handleFix} disabled={isFixing}>
            {isFixing ? 'جاري الإصلاح...' : 'إصلاح المشاكل تلقائياً'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

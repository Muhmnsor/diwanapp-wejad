
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Tools, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isDeveloper } from "@/utils/developer/roleManagement";
import { useAuthStore } from "@/store/refactored-auth";

interface WorkflowDiagnosticsProps {
  diagnosticResult: any;
  requestId: string;
  isDiagnosing: boolean;
  onDiagnose: () => Promise<any>;
  onFix: () => Promise<any>;
  onSuccess: () => Promise<any>;
  error?: Error | null;
}

export const WorkflowDiagnostics: React.FC<WorkflowDiagnosticsProps> = ({
  diagnosticResult,
  requestId,
  isDiagnosing,
  onDiagnose,
  onFix,
  onSuccess,
  error
}) => {
  const { user } = useAuthStore();
  const [canSeeTools, setCanSeeTools] = React.useState(false);

  // Check if user is admin or developer
  React.useEffect(() => {
    const checkPermissions = async () => {
      if (!user?.id) return;
      
      const isAdmin = user.isAdmin;
      if (isAdmin) {
        setCanSeeTools(true);
        return;
      }
      
      const isDev = await isDeveloper(user.id);
      setCanSeeTools(isDev);
    };
    
    checkPermissions();
  }, [user?.id, user?.isAdmin]);

  // If user doesn't have permission, don't show the diagnostic tools
  if (!canSeeTools) {
    return null;
  }

  // If the diagnostic operation is running, show a loading state
  if (isDiagnosing) {
    return (
      <div className="w-full">
        <Button variant="outline" className="w-full" disabled>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          جاري تشخيص مسار العمل...
        </Button>
      </div>
    );
  }

  // If we have diagnostic results, show them
  if (diagnosticResult) {
    const hasIssues = diagnosticResult.issues && diagnosticResult.issues.length > 0;

    return (
      <div className="w-full space-y-3">
        <Alert variant={hasIssues ? "destructive" : "success"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {hasIssues 
              ? "تم العثور على مشاكل في مسار العمل"
              : "لا توجد مشاكل في مسار العمل"}
          </AlertDescription>
        </Alert>
        
        {hasIssues && (
          <div className="space-y-2">
            <div className="text-sm font-medium">المشاكل المكتشفة:</div>
            <ul className="list-disc list-inside">
              {diagnosticResult.issues.map((issue: string, index: number) => (
                <li key={index} className="text-sm">{issue}</li>
              ))}
            </ul>
            <Button 
              onClick={onFix} 
              className="w-full mt-2"
              variant="secondary"
            >
              <Tools className="w-4 h-4 mr-2" />
              إصلاح المشاكل
            </Button>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <Button 
            onClick={onDiagnose} 
            variant="outline" 
            size="sm"
          >
            إعادة تشخيص
          </Button>
          
          <Button 
            onClick={onSuccess} 
            variant="outline" 
            size="sm"
          >
            تحديث البيانات
          </Button>
        </div>
        
        {diagnosticResult.debug_info && process.env.NODE_ENV === 'development' && (
          <div className="text-xs mt-2 p-2 bg-muted rounded">
            <Badge variant="outline" className="mb-1">معلومات التشخيص</Badge>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(diagnosticResult.debug_info, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // Default state - show the diagnose button
  return (
    <div className="w-full">
      <Button 
        onClick={onDiagnose}
        variant="outline"
        className="w-full"
        size="sm"
      >
        <Tools className="w-4 h-4 mr-2" />
        تشخيص مسار العمل
      </Button>
    </div>
  );
};

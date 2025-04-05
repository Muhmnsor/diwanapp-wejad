
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  fallback 
}) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  React.useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('Caught in ErrorBoundary:', error);
      setError(error.error);
      setHasError(true);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-red-700 mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-red-600 mb-4">
          {error?.message || 'لم نتمكن من عرض البيانات المطلوبة.'}
        </p>
        <Button 
          variant="outline"
          onClick={() => {
            setHasError(false);
            setError(null);
            window.location.reload();
          }}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          إعادة تحميل الصفحة
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

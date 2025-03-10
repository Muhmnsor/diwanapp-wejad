
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ReportsTab = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">التقارير المالية</h2>
        <Button size="sm">
          <FileText className="h-4 w-4 ml-2" />
          إنشاء تقرير جديد
        </Button>
      </div>

      <Card className="p-4">
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة مرة أخرى.
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : reports.length > 0 ? (
          <div className="space-y-2">
            {/* Report items would be mapped here */}
          </div>
        ) : (
          <p className="text-muted-foreground">لا توجد تقارير مالية متاحة حالياً.</p>
        )}
      </Card>
    </div>
  );
};

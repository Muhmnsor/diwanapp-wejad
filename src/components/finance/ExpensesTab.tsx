
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const ExpensesTab = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">المصروفات</h2>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 ml-2" />
          إضافة مصروف
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
        ) : expenses.length > 0 ? (
          <div className="space-y-2">
            {/* Expense items would be mapped here */}
          </div>
        ) : (
          <p className="text-muted-foreground">لا توجد مصروفات مسجلة حالياً.</p>
        )}
      </Card>
    </div>
  );
};

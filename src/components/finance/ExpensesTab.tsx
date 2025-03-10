
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export const ExpensesTab = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
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

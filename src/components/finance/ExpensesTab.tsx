
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExpensesTable } from "./ExpensesTable";
import { ExpenseForm } from "./ExpenseForm";

export const ExpensesTab = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => setIsFormOpen(true);
  const handleCloseForm = () => setIsFormOpen(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">المصروفات المالية</h2>
        <Button onClick={handleOpenForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إضافة مصروف جديد</span>
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>إضافة مصروف جديد</CardTitle>
            <CardDescription>أدخل تفاصيل المصروف والبند المصروف منه</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseForm onCancel={handleCloseForm} onSubmit={handleCloseForm} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>قائمة المصروفات</CardTitle>
          <CardDescription>جميع المصروفات التي تم تسجيلها</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpensesTable />
        </CardContent>
      </Card>
    </div>
  );
};

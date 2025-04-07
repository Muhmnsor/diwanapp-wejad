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
import { ReceiptsTable } from "./ReceiptsTable";
import { ReceiptForm } from "./ReceiptForm";

export const ReceiptsTab = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => setIsFormOpen(true);
  const handleCloseForm = () => setIsFormOpen(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">سندات القبض</h2>
        <Button onClick={handleOpenForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إضافة سند قبض جديد</span>
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>إضافة سند قبض جديد</CardTitle>
            <CardDescription>أدخل تفاصيل سند القبض والحساب المستلم منه</CardDescription>
          </CardHeader>
          <CardContent>
            <ReceiptForm onCancel={handleCloseForm} onSubmit={handleCloseForm} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>قائمة سندات القبض</CardTitle>
          <CardDescription>جميع سندات القبض التي تم تسجيلها</CardDescription>
        </CardHeader>
        <CardContent>
          <ReceiptsTable />
        </CardContent>
      </Card>
    </div>
  );
};


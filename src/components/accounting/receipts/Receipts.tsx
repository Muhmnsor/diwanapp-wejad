import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ReceiptsTable } from "./ReceiptsTable";
import { ReceiptForm } from "./ReceiptForm";
import { Receipt } from "@/hooks/accounting/useReceipts";

export const Receipts = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const handleAddReceipt = () => {
    setSelectedReceipt(null);
    setShowForm(true);
  };

  const handleEditReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedReceipt(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">سندات القبض</h2>
        <Button onClick={handleAddReceipt} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          سند قبض جديد
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-right">
              {selectedReceipt ? "تعديل سند قبض" : "إنشاء سند قبض جديد"}
            </CardTitle>
            <CardDescription className="text-right">
              {selectedReceipt ? "قم بتعديل بيانات سند القبض" : "أدخل بيانات سند القبض الجديد"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReceiptForm 
              receipt={selectedReceipt}
              onCancel={handleFormClose}
              onSuccess={handleFormClose}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-right">سجل سندات القبض</CardTitle>
          <CardDescription className="text-right">
            سجل جميع سندات القبض التي تم إصدارها في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReceiptsTable onEditReceipt={handleEditReceipt} />
        </CardContent>
      </Card>
    </>
  );
};


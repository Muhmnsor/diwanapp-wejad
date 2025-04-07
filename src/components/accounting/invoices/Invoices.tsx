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
import { InvoicesTable } from "./InvoicesTable";
import { InvoiceForm } from "./InvoiceForm";
import { Invoice } from "@/hooks/accounting/useInvoices";

export const Invoices = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setShowForm(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedInvoice(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">الفواتير</h2>
        <Button onClick={handleAddInvoice} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          فاتورة جديدة
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-right">
              {selectedInvoice ? "تعديل فاتورة" : "إنشاء فاتورة جديدة"}
            </CardTitle>
            <CardDescription className="text-right">
              {selectedInvoice ? "قم بتعديل بيانات الفاتورة" : "أدخل بيانات الفاتورة الجديدة"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceForm 
              invoice={selectedInvoice}
              onCancel={handleFormClose}
              onSuccess={handleFormClose}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-right">سجل الفواتير</CardTitle>
          <CardDescription className="text-right">
            سجل جميع الفواتير التي تم إصدارها في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvoicesTable onEditInvoice={handleEditInvoice} />
        </CardContent>
      </Card>
    </>
  );
};


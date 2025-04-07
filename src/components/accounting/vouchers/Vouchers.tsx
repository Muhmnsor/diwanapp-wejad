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
import { VouchersTable } from "./VouchersTable";
import { VoucherForm } from "./VoucherForm";
import { Voucher } from "@/hooks/accounting/useVouchers";

export const Vouchers = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const handleAddVoucher = () => {
    setSelectedVoucher(null);
    setShowForm(true);
  };

  const handleEditVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedVoucher(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">سندات الصرف</h2>
        <Button onClick={handleAddVoucher} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          سند صرف جديد
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-right">
              {selectedVoucher ? "تعديل سند صرف" : "إنشاء سند صرف جديد"}
            </CardTitle>
            <CardDescription className="text-right">
              {selectedVoucher ? "قم بتعديل بيانات سند الصرف" : "أدخل بيانات سند الصرف الجديد"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VoucherForm 
              voucher={selectedVoucher}
              onCancel={handleFormClose}
              onSuccess={handleFormClose}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-right">سجل سندات الصرف</CardTitle>
          <CardDescription className="text-right">
            سجل جميع سندات الصرف التي تم إصدارها في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VouchersTable onEditVoucher={handleEditVoucher} />
        </CardContent>
      </Card>
    </>
  );
};


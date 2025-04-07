import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/dateUtils";
import { Printer } from "lucide-react";

interface ReceiptViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: any;
  accounts: any[];
}

export const ReceiptViewDialog = ({
  isOpen,
  onOpenChange,
  receipt,
  accounts,
}: ReceiptViewDialogProps) => {
  const getAccountName = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "غير محدد";
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'نقدي';
      case 'check': return 'شيك';
      case 'bank_transfer': return 'تحويل بنكي';
      default: return method;
    }
  };

  const getReceiptTypeText = (type: string) => {
    switch (type) {
      case 'revenue': return 'إيراد';
      case 'advance_payment': return 'دفعة مقدمة';
      case 'debt_collection': return 'تحصيل دين';
      default: return type;
    }
  };

  const handlePrint = () => {
    // سيتم تنفيذ منطق الطباعة هنا
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>سند قبض رقم: {receipt.receipt_number}</DialogTitle>
        </DialogHeader>
        
        <div className="border-t border-b py-4 my-4">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-primary">سند قبض</h2>
            <p className="text-gray-500">رقم: {receipt.receipt_number}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="font-semibold">التاريخ:</p>
              <p>{formatDate(receipt.date)}</p>
            </div>
            <div>
              <p className="font-semibold">نوع السند:</p>
              <p>{getReceiptTypeText(receipt.receipt_type)}</p>
            </div>
            <div>
              <p className="font-semibold">طريقة الدفع:</p>
              <p>{getPaymentMethodText(receipt.payment_method)}</p>
            </div>
            <div>
              <p className="font-semibold">الحساب:</p>
              <p>{receipt.account_id ? getAccountName(receipt.account_id) : "غير محدد"}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">معلومات الدافع</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">الاسم:</p>
                <p>{receipt.payer_name}</p>
              </div>
              <div>
                <p className="font-semibold">رقم الهاتف:</p>
                <p>{receipt.payer_phone || "—"}</p>
              </div>
              <div>
                <p className="font-semibold">البريد الإلكتروني:</p>
                <p>{receipt.payer_email || "—"}</p>
              </div>
              <div>
                <p className="font-semibold">العنوان:</p>
                <p>{receipt.payer_address || "—"}</p>
              </div>
            </div>
          </div>

          {receipt.items && Array.isArray(JSON.parse(receipt.items)) && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">بنود السند</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-right">الوصف</th>
                    <th className="border p-2 text-left">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {JSON.parse(receipt.items).map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="border p-2">{item.description || "—"}</td>
                      <td className="border p-2 text-left">{item.amount.toLocaleString()} ريال</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="border p-2 text-right">المجموع</td>
                    <td className="border p-2 text-left">{receipt.total_amount.toLocaleString()} ريال</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {receipt.notes && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">ملاحظات</h3>
              <p className="p-2 bg-gray-50 rounded">{receipt.notes}</p>
            </div>
          )}
          
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <p className="font-semibold mb-1">المستلم:</p>
              <div className="border-t pt-8 mt-12">التوقيع: ________________</div>
            </div>
            <div>
              <p className="font-semibold mb-1">الدافع:</p>
              <div className="border-t pt-8 mt-12">التوقيع: ________________</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
          <Button className="flex items-center gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


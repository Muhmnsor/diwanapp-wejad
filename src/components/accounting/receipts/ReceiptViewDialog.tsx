import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Receipt } from "@/hooks/accounting/useReceipts";
import { format } from "date-fns";
import { Printer, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ReceiptViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt;
}

export const ReceiptViewDialog = ({
  open,
  onOpenChange,
  receipt,
}: ReceiptViewDialogProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">مسودة</Badge>;
      case "final":
        return <Badge variant="success">نهائي</Badge>;
      case "cancelled":
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "نقدي";
      case "bank_transfer":
        return "تحويل بنكي";
      case "check":
        return "شيك";
      case "credit_card":
        return "بطاقة ائتمان";
      default:
        return method;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // تنفيذ وظيفة التحميل كملف PDF
    alert("سيتم تنفيذ وظيفة التحميل قريباً");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4" /> طباعة
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" /> تحميل PDF
              </Button>
            </div>
            <DialogTitle className="text-right">
              سند قبض رقم: {receipt.receipt_number}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="print:p-10">
          <div className="flex flex-col sm:flex-row justify-between mb-8">
            <div className="text-right mb-4 sm:mb-0">
              <div className="text-2xl font-bold">
                سند قبض{" "}
                {receipt.receipt_type === "revenue" ? "إيرادات" : "استرداد"}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span>الحالة:</span>
                {getStatusBadge(receipt.status)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">التاريخ: {format(new Date(receipt.date), "yyyy/MM/dd")}</div>
              <div className="font-medium">طريقة الدفع: {getPaymentMethodLabel(receipt.payment_method)}</div>
              {receipt.payment_method === "check" && receipt.check_number && (
                <div className="font-medium">رقم الشيك: {receipt.check_number}</div>
              )}
              {receipt.payment_method === "bank_transfer" && receipt.bank_account_number && (
                <div className="font-medium">رقم الحساب: {receipt.bank_account_number}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="text-right">
              <h3 className="font-bold mb-2">بيانات المنشأة</h3>
              <div>اسم المنشأة: شركة النظام المحاسبي</div>
              <div>العنوان: الرياض، المملكة العربية السعودية</div>
              <div>الهاتف: +966 123456789</div>
              <div>البريد الإلكتروني: info@example.com</div>
              <div>الرقم الضريبي: 1234567890</div>
            </div>
            <div className="text-right">
              <h3 className="font-bold mb-2">بيانات الدافع</h3>
              <div>الاسم: {receipt.payer_name}</div>
              {receipt.payer_address && <div>العنوان: {receipt.payer_address}</div>}
              {receipt.payer_phone && <div>الهاتف: {receipt.payer_phone}</div>}
              {receipt.payer_email && <div>البريد الإلكتروني: {receipt.payer_email}</div>}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold mb-4 text-right">تفاصيل السند</h3>
            <div className="border rounded-md">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-right">الوصف</th>
                    <th className="p-3 text-right">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 text-right">{item.description}</td>
                      <td className="p-3 text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between font-bold">
                <span>المجموع:</span>
                <span>{formatCurrency(receipt.total_amount)}</span>
              </div>
            </div>
          </div>

          {receipt.notes && (
            <div className="mb-8">
              <h3 className="font-bold mb-2 text-right">ملاحظات</h3>
              <div className="p-4 bg-gray-50 rounded-md text-right">
                {receipt.notes}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="text-right">
              <div className="border-t pt-4">
                <h4 className="font-bold mb-2">تم الاستلام بواسطة:</h4>
                <div className="h-16"></div>
                <p>الاسم والتوقيع</p>
              </div>
            </div>
            <div className="text-right">
              <div className="border-t pt-4">
                <h4 className="font-bold mb-2">ختم الشركة:</h4>
                <div className="h-16"></div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


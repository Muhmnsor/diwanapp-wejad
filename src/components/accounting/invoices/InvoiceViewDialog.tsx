import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Invoice } from "@/hooks/accounting/useInvoices";
import { format } from "date-fns";
import { Printer, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface InvoiceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
}

export const InvoiceViewDialog = ({
  open,
  onOpenChange,
  invoice,
}: InvoiceViewDialogProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">مسودة</Badge>;
      case "sent":
        return <Badge variant="secondary">مرسلة</Badge>;
      case "paid":
        return <Badge variant="success">مدفوعة</Badge>;
      case "cancelled":
        return <Badge variant="destructive">ملغاة</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
              فاتورة رقم: {invoice.invoice_number}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="print:p-10">
          <div className="flex flex-col sm:flex-row justify-between mb-8">
            <div className="text-right mb-4 sm:mb-0">
              <div className="text-2xl font-bold">
                فاتورة{" "}
                {invoice.invoice_type === "sales" ? "مبيعات" : "مشتريات"}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span>الحالة:</span>
                {getStatusBadge(invoice.status)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">التاريخ: {format(new Date(invoice.date), "yyyy/MM/dd")}</div>
              <div className="font-medium">تاريخ الاستحقاق: {format(new Date(invoice.due_date), "yyyy/MM/dd")}</div>
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
              <h3 className="font-bold mb-2">بيانات {invoice.invoice_type === "sales" ? "العميل" : "المورد"}</h3>
              <div>الاسم: {invoice.customer_name}</div>
              {invoice.customer_address && <div>العنوان: {invoice.customer_address}</div>}
              {invoice.customer_phone && <div>الهاتف: {invoice.customer_phone}</div>}
              {invoice.customer_email && <div>البريد الإلكتروني: {invoice.customer_email}</div>}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold mb-4 text-right">تفاصيل الفاتورة</h3>
            <div className="border rounded-md">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-right">الوصف</th>
                    <th className="p-3 text-right">الكمية</th>
                    <th className="p-3 text-right">سعر الوحدة</th>
                    <th className="p-3 text-right">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 text-right">{item.description}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="p-3 text-right">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between">
                <span>المجموع قبل الضريبة:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>ضريبة القيمة المضافة ({invoice.tax_rate}%):</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>المجموع النهائي:</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mb-8">
              <h3 className="font-bold mb-2 text-right">ملاحظات</h3>
              <div className="p-4 bg-gray-50 rounded-md text-right">
                {invoice.notes}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="font-bold mb-2 text-right">شروط وأحكام</h3>
            <div className="p-4 bg-gray-50 rounded-md text-right">
              <ol className="list-decimal list-inside">
                <li>يتم سداد المبلغ خلال المدة المتفق عليها في الفاتورة</li>
                <li>يتم تطبيق ضريبة القيمة المضافة حسب القوانين والأنظمة المعمول بها</li>
                <li>تعتبر هذه الفاتورة صالحة بدون توقيع أو ختم</li>
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


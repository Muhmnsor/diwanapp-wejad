import { formatDate } from "@/utils/dateUtils";

interface ReceiptPrintViewProps {
  receipt: any;
  accountName?: string;
}

export const ReceiptPrintView = ({
  receipt,
  accountName = "غير محدد",
}: ReceiptPrintViewProps) => {
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

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="border-2 border-gray-300 p-6 rounded-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">سند قبض</h1>
          <p className="text-lg text-gray-600 mt-1">رقم: {receipt.receipt_number}</p>
          <p className="text-gray-500 mt-1">التاريخ: {formatDate(receipt.date)}</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 text-md">
          <div className="border rounded p-3 bg-gray-50">
            <span className="font-semibold ml-2">نوع السند:</span>
            <span>{getReceiptTypeText(receipt.receipt_type)}</span>
          </div>
          <div className="border rounded p-3 bg-gray-50">
            <span className="font-semibold ml-2">طريقة الدفع:</span>
            <span>{getPaymentMethodText(receipt.payment_method)}</span>
          </div>
          <div className="border rounded p-3 bg-gray-50">
            <span className="font-semibold ml-2">الحساب:</span>
            <span>{accountName}</span>
          </div>
          
          {receipt.payment_method === 'check' && (
            <div className="border rounded p-3 bg-gray-50">
              <span className="font-semibold ml-2">رقم الشيك:</span>
              <span>{receipt.check_number}</span>
            </div>
          )}
          
          {receipt.payment_method === 'bank_transfer' && (
            <div className="border rounded p-3 bg-gray-50">
              <span className="font-semibold ml-2">رقم الحساب البنكي:</span>
              <span>{receipt.bank_account_number}</span>
            </div>
          )}
        </div>

        <div className="mb-6 border rounded p-4">
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">معلومات الدافع</h2>
          <div className="grid grid-cols-2 gap-4 text-md">
            <div>
              <span className="font-semibold ml-2">الاسم:</span>
              <span>{receipt.payer_name}</span>
            </div>
            <div>
              <span className="font-semibold ml-2">رقم الهاتف:</span>
              <span>{receipt.payer_phone || "—"}</span>
            </div>
            <div>
              <span className="font-semibold ml-2">البريد الإلكتروني:</span>
              <span>{receipt.payer_email || "—"}</span>
            </div>
            <div>
              <span className="font-semibold ml-2">العنوان:</span>
              <span>{receipt.payer_address || "—"}</span>
            </div>
          </div>
        </div>

        {receipt.items && Array.isArray(JSON.parse(receipt.items)) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">تفاصيل السند</h2>
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-2 border-gray-300 p-3 text-right">الوصف</th>
                  <th className="border-2 border-gray-300 p-3 text-left">المبلغ (ريال)</th>
                </tr>
              </thead>
              <tbody>
                {JSON.parse(receipt.items).map((item: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border-2 border-gray-300 p-3">{item.description || "—"}</td>
                    <td className="border-2 border-gray-300 p-3 text-left">{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-gray-200 font-bold text-lg">
                  <td className="border-2 border-gray-300 p-3 text-right">المجموع</td>
                  <td className="border-2 border-gray-300 p-3 text-left">{receipt.total_amount.toLocaleString()} ريال</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {receipt.notes && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">ملاحظات</h2>
            <div className="border-2 border-gray-300 p-3 rounded bg-gray-50">
              {receipt.notes}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 mt-12">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">المستلم</h3>
            <div className="border-t-2 border-gray-300 pt-10 mt-8">
              <p>الاسم: ______________________</p>
              <p className="mt-4">التوقيع: ______________________</p>
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">الدافع</h3>
            <div className="border-t-2 border-gray-300 pt-10 mt-8">
              <p>الاسم: ______________________</p>
              <p className="mt-4">التوقيع: ______________________</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm mt-4">
        <p>تم إنشاء هذا السند بواسطة نظام إدارة التقديرات</p>
        <p className="mt-1">طُبع بتاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
      </div>
    </div>
  );
};


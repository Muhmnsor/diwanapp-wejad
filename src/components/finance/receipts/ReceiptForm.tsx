import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReceiptFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

interface Account {
  id: string;
  name: string;
  code: string;
}

interface CostCenter {
  id: string;
  name: string;
  code: string;
}

interface ReceiptItem {
  description: string;
  amount: number;
}

export const ReceiptForm = ({ onCancel, onSubmit }: ReceiptFormProps) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  
  const [receiptNumber, setReceiptNumber] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedCostCenterId, setSelectedCostCenterId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  
  const [payerName, setPayerName] = useState("");
  const [payerAddress, setPayerAddress] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  
  const [receiptType, setReceiptType] = useState("revenue");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [checkNumber, setCheckNumber] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [items, setItems] = useState<ReceiptItem[]>([{ description: "", amount: 0 }]);
  const [isLoading, setIsLoading] = useState(false);

  // جلب الحسابات ومراكز التكلفة من قاعدة البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب الحسابات
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounting_accounts')
          .select('id, name, code')
          .eq('is_active', true);

        if (accountsError) throw accountsError;
        setAccounts(accountsData || []);

        // جلب مراكز التكلفة
        const { data: costCentersData, error: costCentersError } = await supabase
          .from('accounting_cost_centers')
          .select('id, name, code')
          .eq('is_active', true);

        if (costCentersError) throw costCentersError;
        setCostCenters(costCentersData || []);

        // جلب الفواتير غير المدفوعة
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('accounting_invoices')
          .select('id, invoice_number, total_amount, customer_name')
          .eq('status', 'issued');

        if (invoicesError) throw invoicesError;
        setInvoices(invoicesData || []);

        // انشاء رقم سند قبض فريد
        generateReceiptNumber();

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'حدث خطأ أثناء جلب البيانات',
          variant: 'destructive'
        });
      }
    };

    fetchData();
  }, []);

  // توليد رقم سند جديد
  const generateReceiptNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('accounting_receipts')
        .select('receipt_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let newNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = parseInt(data[0].receipt_number.replace('RCT-', ''), 10);
        newNumber = lastNumber + 1;
      }

      setReceiptNumber(`RCT-${newNumber.toString().padStart(5, '0')}`);
    } catch (error) {
      console.error('Error generating receipt number:', error);
      setReceiptNumber(`RCT-${Date.now().toString().slice(-5)}`);
    }
  };

  // إضافة عنصر جديد
  const addItem = () => {
    setItems([...items, { description: "", amount: 0 }]);
  };

  // حذف عنصر
  const removeItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    updateTotal(newItems);
  };

  // تحديث عنصر
  const updateItem = (index: number, field: keyof ReceiptItem, value: any) => {
    const newItems = [...items];
    if (field === 'amount') {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
    updateTotal(newItems);
  };

  // تحديث المجموع
  const updateTotal = (newItems: ReceiptItem[]) => {
    const sum = newItems.reduce((total, item) => total + item.amount, 0);
    setTotalAmount(sum);
  };

  // تحديث معلومات العميل من الفاتورة
  const updateFromInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setPayerName(invoice.customer_name);
      setTotalAmount(invoice.total_amount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من إدخال المعلومات الضرورية
    if (!receiptNumber || !payerName || (typeof totalAmount !== "number" || totalAmount <= 0)) {
      toast({
        title: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // إضافة سند القبض إلى قاعدة البيانات
      const { error } = await supabase
        .from('accounting_receipts')
        .insert({
          receipt_number: receiptNumber,
          date,
          payer_name: payerName,
          payer_address: payerAddress || null,
          payer_phone: payerPhone || null,
          payer_email: payerEmail || null,
          receipt_type: receiptType,
          payment_method: paymentMethod,
          check_number: paymentMethod === 'check' ? checkNumber : null,
          bank_account_number: paymentMethod === 'bank_transfer' ? bankAccountNumber : null,
          total_amount: totalAmount,
          notes: notes || null,
          items: JSON.stringify(items),
          account_id: selectedAccountId,
          cost_center_id: selectedCostCenterId,
          invoice_id: selectedInvoiceId,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "تم إضافة سند القبض بنجاح"
      });
      
      onSubmit();
    } catch (error: any) {
      console.error("خطأ في حفظ سند القبض:", error);
      toast({
        title: error.message || "حدث خطأ أثناء حفظ سند القبض",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // عرض حقول إضافية بناءً على طريقة الدفع
  const renderPaymentMethodFields = () => {
    if (paymentMethod === 'check') {
      return (
        <div className="space-y-2">
          <Label htmlFor="checkNumber">رقم الشيك</Label>
          <Input
            id="checkNumber"
            value={checkNumber}
            onChange={(e) => setCheckNumber(e.target.value)}
            placeholder="أدخل رقم الشيك"
          />
        </div>
      );
    }
    
    if (paymentMethod === 'bank_transfer') {
      return (
        <div className="space-y-2">
          <Label htmlFor="bankAccountNumber">رقم الحساب البنكي</Label>
          <Input
            id="bankAccountNumber"
            value={bankAccountNumber}
            onChange={(e) => setBankAccountNumber(e.target.value)}
            placeholder="أدخل رقم الحساب"
          />
        </div>
      );
    }
    
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="receiptNumber">رقم السند</Label>
          <Input
            id="receiptNumber"
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            required
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">التاريخ</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account">الحساب</Label>
          <Select value={selectedAccountId || ""} onValueChange={setSelectedAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الحساب" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.code} - {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="costCenter">مركز التكلفة</Label>
          <Select value={selectedCostCenterId || ""} onValueChange={setSelectedCostCenterId}>
            <SelectTrigger>
              <SelectValue placeholder="اختر مركز التكلفة" />
            </SelectTrigger>
            <SelectContent>
              {costCenters.map((center) => (
                <SelectItem key={center.id} value={center.id}>
                  {center.code} - {center.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="receiptType">نوع السند</Label>
          <Select value={receiptType} onValueChange={setReceiptType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">إيراد</SelectItem>
              <SelectItem value="advance_payment">دفعة مقدمة</SelectItem>
              <SelectItem value="debt_collection">تحصيل دين</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoice">الفاتورة المرتبطة (اختياري)</Label>
          <Select 
            value={selectedInvoiceId || ""} 
            onValueChange={(value) => {
              setSelectedInvoiceId(value);
              updateFromInvoice(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الفاتورة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">بدون فاتورة</SelectItem>
              {invoices.map((invoice) => (
                <SelectItem key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} - {invoice.customer_name} ({invoice.total_amount} ريال)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 border rounded-md p-4">
        <h3 className="font-medium text-lg">معلومات الدافع</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="payerName">اسم الدافع</Label>
            <Input
              id="payerName"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              placeholder="أدخل اسم الدافع"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payerPhone">رقم الهاتف</Label>
            <Input
              id="payerPhone"
              value={payerPhone}
              onChange={(e) => setPayerPhone(e.target.value)}
              placeholder="أدخل رقم الهاتف"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payerEmail">البريد الإلكتروني</Label>
            <Input
              id="payerEmail"
              type="email"
              value={payerEmail}
              onChange={(e) => setPayerEmail(e.target.value)}
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payerAddress">العنوان</Label>
            <Input
              id="payerAddress"
              value={payerAddress}
              onChange={(e) => setPayerAddress(e.target.value)}
              placeholder="أدخل العنوان"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border rounded-md p-4">
        <h3 className="font-medium text-lg">تفاصيل الدفع</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">طريقة الدفع</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">نقدي</SelectItem>
                <SelectItem value="check">شيك</SelectItem>
                <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {renderPaymentMethodFields()}
          
          <div className="space-y-2">
            <Label htmlFor="totalAmount">المبلغ الإجمالي</Label>
            <Input
              id="totalAmount"
              type="number"
              min="0"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border rounded-md p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg">بنود السند</h3>
          <Button 
            type="button" 
            variant="outline"
            size="sm"
            onClick={addItem}
          >
            إضافة بند
          </Button>
        </div>
        
        {items.map((item, index) => (
          <div 
            key={index} 
            className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end"
          >
            <div className="md:col-span-8 space-y-2">
              <Label htmlFor={`item-desc-${index}`}>الوصف</Label>
              <Input
                id={`item-desc-${index}`}
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                placeholder="وصف البند"
              />
            </div>
            
            <div className="md:col-span-3 space-y-2">
              <Label htmlFor={`item-amount-${index}`}>المبلغ</Label>
              <Input
                id={`item-amount-${index}`}
                type="number"
                min="0"
                step="0.01"
                value={item.amount}
                onChange={(e) => updateItem(index, 'amount', e.target.value)}
                placeholder="المبلغ"
              />
            </div>
            
            <div className="md:col-span-1 flex justify-center">
              {items.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive mt-2"
                  onClick={() => removeItem(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="أي ملاحظات إضافية"
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          إلغاء
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? "جاري الحفظ..." : "إضافة سند القبض"}
        </Button>
      </div>
    </form>
  );
};


import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash } from "lucide-react";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any | null;
  onSuccess: () => void;
}

export const InvoiceDialog = ({
  open,
  onOpenChange,
  invoice,
  onSuccess
}: InvoiceDialogProps) => {
  const isEditing = !!invoice;

  // حالة النموذج
  const [formState, setFormState] = useState({
    invoice_number: '',
    date: '',
    due_date: '',
    customer_name: '',
    customer_address: '',
    customer_phone: '',
    customer_email: '',
    invoice_type: 'sales',
    status: 'draft',
    subtotal: 0,
    tax_rate: 15,
    tax_amount: 0,
    total_amount: 0,
    notes: '',
    items: [{ description: '', quantity: 1, unit_price: 0, amount: 0 }],
    account_id: '',
    cost_center_id: ''
  });

  // خيارات الحسابات ومراكز التكلفة
  const [accounts, setAccounts] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // جلب الحسابات ومراكز التكلفة
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // جلب الحسابات
        const { data: accountsData } = await supabase
          .from('accounting_accounts')
          .select('id, name, account_code')
          .filter('account_type', 'in', ['asset', 'revenue', 'expense'])
          .order('account_code');
        
        setAccounts(accountsData || []);

        // جلب مراكز التكلفة
        const { data: centersData } = await supabase
          .from('accounting_cost_centers')
          .select('id, name, code')
          .order('code');
        
        setCostCenters(centersData || []);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    if (open) {
      fetchOptions();
    }
  }, [open]);

  // تحميل بيانات الفاتورة عند التعديل
  useEffect(() => {
    if (invoice && open) {
      setFormState({
        ...invoice,
        date: invoice.date.split('T')[0],
        due_date: invoice.due_date.split('T')[0],
        items: invoice.items || [{ description: '', quantity: 1, unit_price: 0, amount: 0 }]
      });
    } else if (open) {
      // إعادة تعيين النموذج عند الإنشاء
      setFormState({
        invoice_number: `INV-${new Date().getTime().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customer_name: '',
        customer_address: '',
        customer_phone: '',
        customer_email: '',
        invoice_type: 'sales',
        status: 'draft',
        subtotal: 0,
        tax_rate: 15,
        tax_amount: 0,
        total_amount: 0,
        notes: '',
        items: [{ description: '', quantity: 1, unit_price: 0, amount: 0 }],
        account_id: '',
        cost_center_id: ''
      });
    }
  }, [invoice, open]);

  // تحديث الحقل
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // تحديث القائمة المنسدلة
  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // إضافة عنصر جديد للفاتورة
  const addItem = () => {
    setFormState(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0, amount: 0 }]
    }));
  };

  // حذف عنصر من الفاتورة
  const removeItem = (index: number) => {
    setFormState(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // تحديث عنصر في الفاتورة
  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...formState.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // حساب المبلغ تلقائيًا
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? Number(value) : Number(newItems[index].quantity);
      const unitPrice = field === 'unit_price' ? Number(value) : Number(newItems[index].unit_price);
      newItems[index].amount = quantity * unitPrice;
    }

    setFormState(prev => ({
      ...prev,
      items: newItems
    }));

    // إعادة حساب المجاميع
    calculateTotals(newItems);
  };

  // حساب المجاميع
  const calculateTotals = (items: any[]) => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.amount), 0);
    const taxAmount = (subtotal * formState.tax_rate) / 100;
    const totalAmount = subtotal + taxAmount;

    setFormState(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    }));
  };

  // حفظ الفاتورة
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // التحقق من البيانات الإلزامية
      if (!formState.customer_name || !formState.invoice_type || !formState.date) {
        toast({
          title: "بيانات غير مكتملة",
          description: "يرجى ملء جميع الحقول الإلزامية",
          variant: "destructive",
        });
        return;
      }

      // إنشاء أو تحديث الفاتورة
      const { data, error } = isEditing
        ? await supabase
            .from('accounting_invoices')
            .update({
              invoice_number: formState.invoice_number,
              date: formState.date,
              due_date: formState.due_date,
              customer_name: formState.customer_name,
              customer_address: formState.customer_address,
              customer_phone: formState.customer_phone,
              customer_email: formState.customer_email,
              invoice_type: formState.invoice_type,
              status: formState.status,
              subtotal: formState.subtotal,
              tax_rate: formState.tax_rate,
              tax_amount: formState.tax_amount,
              total_amount: formState.total_amount,
              notes: formState.notes,
              items: formState.items,
              account_id: formState.account_id,
              cost_center_id: formState.cost_center_id
            })
            .eq('id', invoice.id)
            .select()
        : await supabase
            .from('accounting_invoices')
            .insert({
              invoice_number: formState.invoice_number,
              date: formState.date,
              due_date: formState.due_date,
              customer_name: formState.customer_name,
              customer_address: formState.customer_address,
              customer_phone: formState.customer_phone,
              customer_email: formState.customer_email,
              invoice_type: formState.invoice_type,
              status: formState.status,
              subtotal: formState.subtotal,
              tax_rate: formState.tax_rate,
              tax_amount: formState.tax_amount,
              total_amount: formState.total_amount,
              notes: formState.notes,
              items: formState.items,
              account_id: formState.account_id,
              cost_center_id: formState.cost_center_id
            })
            .select();

      if (error) throw error;

      // إنشاء قيد محاسبي للفاتورة
      if (formState.status === 'paid') {
        // تنفيذ إنشاء قيد محاسبي فقط إذا كان حالة الفاتورة "مدفوعة"
        await createJournalEntry(data[0].id);
      }

      toast({
        title: isEditing ? "تم تحديث الفاتورة" : "تم إنشاء الفاتورة",
        description: isEditing 
          ? "تم تحديث بيانات الفاتورة بنجاح" 
          : "تم إنشاء الفاتورة الجديدة بنجاح",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: "خطأ في حفظ البيانات",
        description: "حدث خطأ أثناء حفظ الفاتورة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // إنشاء قيد محاسبي للفاتورة
  const createJournalEntry = async (invoiceId: string) => {
    try {
      const journalEntry = {
        date: formState.date,
        reference_number: formState.invoice_number,
        description: `فاتورة ${formState.invoice_type === 'sales' ? 'مبيعات' : 'مشتريات'} - ${formState.customer_name}`,
        amount: formState.total_amount,
        entry_type: formState.invoice_type === 'sales' ? 'revenue' : 'expense',
        status: 'posted',
        cost_center_id: formState.cost_center_id,
        is_invoice_entry: true,
        invoice_id: invoiceId
      };

      // إنشاء إدخال دفتر اليومية
      const { data, error } = await supabase
        .from('accounting_journal_entries')
        .insert(journalEntry)
        .select();

      if (error) throw error;

      // لاحقاً يمكن إضافة إنشاء تفاصيل القيد هنا
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'تعديل فاتورة' : 'إنشاء فاتورة جديدة'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="invoice_number">رقم الفاتورة</Label>
              <Input
                id="invoice_number"
                name="invoice_number"
                value={formState.invoice_number}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="date">تاريخ الفاتورة</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formState.date}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="due_date">تاريخ الاستحقاق</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={formState.due_date}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="invoice_type">نوع الفاتورة</Label>
              <Select
                value={formState.invoice_type}
                onValueChange={(value) => handleSelectChange('invoice_type', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر نوع الفاتورة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">فاتورة مبيعات</SelectItem>
                  <SelectItem value="purchase">فاتورة مشتريات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">حالة الفاتورة</Label>
              <Select
                value={formState.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر حالة الفاتورة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="pending">في انتظار الدفع</SelectItem>
                  <SelectItem value="paid">مدفوعة</SelectItem>
                  <SelectItem value="cancelled">ملغاة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="customer_name">اسم العميل/المورد</Label>
              <Input
                id="customer_name"
                name="customer_name"
                value={formState.customer_name}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="customer_address">العنوان</Label>
              <Input
                id="customer_address"
                name="customer_address"
                value={formState.customer_address}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="customer_phone">رقم الهاتف</Label>
              <Input
                id="customer_phone"
                name="customer_phone"
                value={formState.customer_phone}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="customer_email">البريد الإلكتروني</Label>
              <Input
                id="customer_email"
                name="customer_email"
                type="email"
                value={formState.customer_email}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tax_rate">نسبة الضريبة (%)</Label>
              <Input
                id="tax_rate"
                name="tax_rate"
                type="number"
                value={formState.tax_rate}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>عناصر الفاتورة</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addItem} 
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة عنصر</span>
            </Button>
          </div>

          <div className="border rounded-md p-4 space-y-4">
            <div className="grid grid-cols-12 gap-2 font-medium text-sm pb-2 border-b">
              <div className="col-span-5">الوصف</div>
              <div className="col-span-2">الكمية</div>
              <div className="col-span-2">سعر الوحدة</div>
              <div className="col-span-2">المبلغ</div>
              <div className="col-span-1"></div>
            </div>

            {formState.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="وصف العنصر"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    min="1"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.amount}
                    readOnly
                  />
                </div>
                <div className="col-span-1">
                  {formState.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-12 gap-2 mt-4 pt-3 border-t text-sm">
              <div className="col-span-7 text-left">المجموع الفرعي:</div>
              <div className="col-span-5">
                <Input
                  type="number"
                  value={formState.subtotal}
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 text-sm">
              <div className="col-span-7 text-left">الضريبة ({formState.tax_rate}%):</div>
              <div className="col-span-5">
                <Input
                  type="number"
                  value={formState.tax_amount}
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 font-bold text-sm">
              <div className="col-span-7 text-left">المجموع:</div>
              <div className="col-span-5">
                <Input
                  type="number"
                  value={formState.total_amount}
                  readOnly
                  className="font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="account_id">الحساب المرتبط</Label>
              <Select
                value={formState.account_id}
                onValueChange={(value) => handleSelectChange('account_id', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر الحساب" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cost_center_id">مركز التكلفة</Label>
              <Select
                value={formState.cost_center_id}
                onValueChange={(value) => handleSelectChange('cost_center_id', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر مركز التكلفة" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map(center => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.code} - {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formState.notes}
              onChange={handleChange}
              className="mt-1 h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'جارِ الحفظ...' : isEditing ? 'تحديث' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id?: string;
  invoice_number: string;
  date: string;
  due_date: string;
  customer_name: string;
  customer_address?: string;
  customer_phone?: string;
  customer_email?: string;
  invoice_type: 'sales' | 'purchase';
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  items: InvoiceItem[];
  account_id?: string;
  cost_center_id?: string;
}

export const useInvoices = () => {
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ["accounting_invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_invoices")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Invoice[];
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (invoice: Omit<Invoice, "id">) => {
      const { data, error } = await supabase
        .from("accounting_invoices")
        .insert(invoice)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // إنشاء قيد محاسبي تلقائي للفاتورة
      if (invoice.status !== 'draft') {
        await createJournalEntryForInvoice(data);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting_invoices"] });
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async (invoice: Invoice) => {
      const { id, ...rest } = invoice;
      const { data, error } = await supabase
        .from("accounting_invoices")
        .update(rest)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting_invoices"] });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("accounting_invoices")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting_invoices"] });
    },
  });

  return {
    invoices,
    isLoading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
};

// إنشاء قيد محاسبي للفاتورة
async function createJournalEntryForInvoice(invoice: Invoice) {
  // تحديد الحسابات بناءً على نوع الفاتورة
  const entryData = {
    date: invoice.date,
    description: `فاتورة ${invoice.invoice_type === 'sales' ? 'مبيعات' : 'مشتريات'} رقم ${invoice.invoice_number}`,
    status: 'posted',
    total_amount: invoice.total_amount,
    is_invoice_entry: true,
    invoice_id: invoice.id,
    items: invoice.invoice_type === 'sales' 
      ? [
          // مدين: حساب العملاء أو النقدية
          {
            account_id: invoice.account_id || 'default_accounts_receivable_id',
            debit_amount: invoice.total_amount,
            credit_amount: 0,
            description: `مدين - ${invoice.customer_name}`,
            cost_center_id: invoice.cost_center_id
          },
          // دائن: حساب المبيعات
          {
            account_id: 'default_sales_account_id',
            debit_amount: 0,
            credit_amount: invoice.subtotal,
            description: 'دائن - إيرادات المبيعات',
            cost_center_id: invoice.cost_center_id
          },
          // دائن: حساب الضريبة (إذا كان هناك ضريبة)
          ...(invoice.tax_amount > 0 ? [{
            account_id: 'default_tax_account_id',
            debit_amount: 0,
            credit_amount: invoice.tax_amount,
            description: 'دائن - ضريبة القيمة المضافة',
            cost_center_id: invoice.cost_center_id
          }] : [])
        ]
      : [
          // مدين: حساب المشتريات
          {
            account_id: 'default_purchases_account_id',
            debit_amount: invoice.subtotal,
            credit_amount: 0,
            description: 'مدين - المشتريات',
            cost_center_id: invoice.cost_center_id
          },
          // مدين: حساب الضريبة (إذا كان هناك ضريبة)
          ...(invoice.tax_amount > 0 ? [{
            account_id: 'default_tax_account_id',
            debit_amount: invoice.tax_amount,
            credit_amount: 0,
            description: 'مدين - ضريبة القيمة المضافة',
            cost_center_id: invoice.cost_center_id
          }] : []),
          // دائن: حساب الموردين أو النقدية
          {
            account_id: invoice.account_id || 'default_accounts_payable_id',
            debit_amount: 0,
            credit_amount: invoice.total_amount,
            description: `دائن - ${invoice.customer_name}`,
            cost_center_id: invoice.cost_center_id
          },
        ]
  };

  const { error } = await supabase
    .from("accounting_journal_entries")
    .insert(entryData);

  if (error) {
    console.error("Error creating journal entry for invoice:", error);
    throw error;
  }
}


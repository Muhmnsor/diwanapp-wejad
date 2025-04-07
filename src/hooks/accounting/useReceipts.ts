import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReceiptItem {
  id?: string;
  description: string;
  amount: number;
}

export interface Receipt {
  id?: string;
  receipt_number: string;
  date: string;
  payer_name: string;
  payer_address?: string;
  payer_phone?: string;
  payer_email?: string;
  receipt_type: 'revenue' | 'refund';
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'credit_card';
  check_number?: string;
  bank_account_number?: string;
  total_amount: number;
  status: 'draft' | 'final' | 'cancelled';
  notes?: string;
  items: ReceiptItem[];
  account_id?: string;
  cost_center_id?: string;
  invoice_id?: string;
}

export const useReceipts = () => {
  const queryClient = useQueryClient();

  const { data: receipts = [], isLoading, error } = useQuery({
    queryKey: ["accounting_receipts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_receipts")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Receipt[];
    },
  });

  const createReceipt = useMutation({
    mutationFn: async (receipt: Omit<Receipt, "id">) => {
      const { data, error } = await supabase
        .from("accounting_receipts")
        .insert(receipt)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // إنشاء قيد محاسبي تلقائي لسند القبض
      if (receipt.status === 'final') {
        await createJournalEntryForReceipt(data);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting_receipts"] });
      if (receipt.invoice_id) {
        queryClient.invalidateQueries({ queryKey: ["accounting_invoices"] });
      }
    },
  });

  const updateReceipt = useMutation({
    mutationFn: async (receipt: Receipt) => {
      const { id, ...rest } = receipt;
      const { data, error } = await supabase
        .from("accounting_receipts")
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
      queryClient.invalidateQueries({ queryKey: ["accounting_receipts"] });
    },
  });

  const deleteReceipt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("accounting_receipts")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting_receipts"] });
    },
  });

  return {
    receipts,
    isLoading,
    error,
    createReceipt,
    updateReceipt,
    deleteReceipt,
  };
};

// إنشاء قيد محاسبي لسند القبض
async function createJournalEntryForReceipt(receipt: Receipt) {
  const entryData = {
    date: receipt.date,
    description: `سند قبض رقم ${receipt.receipt_number}`,
    status: 'posted',
    total_amount: receipt.total_amount,
    items: receipt.receipt_type === 'revenue' 
      ? [
          // مدين: حساب النقدية أو البنك
          {
            account_id: receipt.account_id || 'default_cash_account_id',
            debit_amount: receipt.total_amount,
            credit_amount: 0,
            description: `مدين - ${receipt.payment_method === 'cash' ? 'النقدية' : 'البنك'}`,
            cost_center_id: receipt.cost_center_id
          },
          // دائن: حساب الإيرادات أو العملاء
          {
            account_id: receipt.invoice_id ? 'default_accounts_receivable_id' : 'default_revenue_account_id',
            debit_amount: 0,
            credit_amount: receipt.total_amount,
            description: receipt.invoice_id 
              ? `دائن - تحصيل فاتورة من ${receipt.payer_name}` 
              : `دائن - إيرادات من ${receipt.payer_name}`,
            cost_center_id: receipt.cost_center_id
          }
        ]
      : [
          // مدين: حساب المردودات
          {
            account_id: 'default_sales_returns_account_id',
            debit_amount: receipt.total_amount,
            credit_amount: 0,
            description: `مدين - مردودات مبيعات`,
            cost_center_id: receipt.cost_center_id
          },
          // دائن: حساب النقدية أو البنك
          {
            account_id: receipt.account_id || 'default_cash_account_id',
            debit_amount: 0,
            credit_amount: receipt.total_amount,
            description: `دائن - ${receipt.payment_method === 'cash' ? 'النقدية' : 'البنك'}`,
            cost_center_id: receipt.cost_center_id
          }
        ]
  };

  const { error } = await supabase
    .from("accounting_journal_entries")
    .insert(entryData);

  if (error) {
    console.error("Error creating journal entry for receipt:", error);
    throw error;
  }
}


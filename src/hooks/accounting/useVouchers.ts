import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VoucherItem {
  id?: string;
  description: string;
  amount: number;
}

export interface Voucher {
  id?: string;
  voucher_number: string;
  date: string;
  beneficiary_name: string;
  voucher_type: 'expense' | 'payment';
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'credit_card';
  check_number?: string;
  bank_account_number?: string;
  total_amount: number;
  status: 'draft' | 'approved' | 'paid' | 'cancelled';
  notes?: string;
  items: VoucherItem[];
  account_id?: string;
  cost_center_id?: string;
  invoice_id?: string;
}

export const useVouchers = () => {
  const queryClient = useQueryClient();

  const { data: vouchers = [], isLoading, error } = useQuery({
    queryKey: ["accounting_payment_vouchers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_payment_vouchers")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Voucher[];
    },
  });

  const createVoucher = useMutation({
    mutationFn: async (voucher: Omit<Voucher, "id">) => {
      const { data, error } = await supabase
        .from("accounting_payment_vouchers")
        .insert(voucher)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // إنشاء قيد محاسبي تلقائي لسند الصرف
      if (voucher.status === 'paid') {
        await createJournalEntryForVoucher(data);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting_payment_vouchers"] });
      if (voucher.invoice_id) {
        queryClient.invalidateQueries({ queryKey: ["accounting_invoices"] });
      }
    },
  });

  const updateVoucher = useMutation({
    mutationFn: async (voucher: Voucher) => {
      const { id, ...rest } = voucher;
      const { data, error } = await supabase
        .from("accounting_payment_vouchers")
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
      queryClient.invalidateQueries({ queryKey: ["accounting_payment_vouchers"] });
    },
  });

  const deleteVoucher = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("accounting_payment_vouchers")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting_payment_vouchers"] });
    },
  });

  return {
    vouchers,
    isLoading,
    error,
    createVoucher,
    updateVoucher,
    deleteVoucher,
  };
};

// إنشاء قيد محاسبي لسند الصرف
async function createJournalEntryForVoucher(voucher: Voucher) {
  const entryData = {
    date: voucher.date,
    description: `سند صرف رقم ${voucher.voucher_number}`,
    status: 'posted',
    total_amount: voucher.total_amount,
    is_voucher_entry: true,
    voucher_id: voucher.id,
    items: voucher.voucher_type === 'expense' 
      ? [
          // مدين: حساب المصروفات
          {
            account_id: 'default_expense_account_id',
            debit_amount: voucher.total_amount,
            credit_amount: 0,
            description: `مدين - مصروفات ${voucher.items[0]?.description || ''}`,
            cost_center_id: voucher.cost_center_id
          },
          // دائن: حساب النقدية أو البنك
          {
            account_id: voucher.account_id || 'default_cash_account_id',
            debit_amount: 0,
            credit_amount: voucher.total_amount,
            description: `دائن - ${voucher.payment_method === 'cash' ? 'النقدية' : 'البنك'}`,
            cost_center_id: voucher.cost_center_id
          }
        ]
      : [
          // مدين: حساب الموردين
          {
            account_id: 'default_accounts_payable_id',
            debit_amount: voucher.total_amount,
            credit_amount: 0,
            description: `مدين - دفع لـ ${voucher.beneficiary_name}`,
            cost_center_id: voucher.cost_center_id
          },
          // دائن: حساب النقدية أو البنك
          {
            account_id: voucher.account_id || 'default_cash_account_id',
            debit_amount: 0,
            credit_amount: voucher.total_amount,
            description: `دائن - ${voucher.payment_method === 'cash' ? 'النقدية' : 'البنك'}`,
            cost_center_id: voucher.cost_center_id
          }
        ]
  };

  const { error } = await supabase
    .from("accounting_journal_entries")
    .insert(entryData);

  if (error) {
    console.error("Error creating journal entry for voucher:", error);
    throw error;
  }
}


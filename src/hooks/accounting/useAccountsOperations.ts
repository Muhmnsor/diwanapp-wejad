
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Account } from "./useAccounts";

export const useAccountsOperations = () => {
  const queryClient = useQueryClient();

  const createAccount = async (accountData: Partial<Account>) => {
    // Determine level based on code structure (e.g., "1.1.2" would be level 3)
    const level = accountData.code ? accountData.code.split('.').length : 1;
    
    const { data, error } = await supabase
      .from("accounting_accounts")
      .insert({
        ...accountData,
        level,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    // Invalidate and refetch accounts
    await queryClient.invalidateQueries({ queryKey: ["accounting_accounts"] });
    
    return data;
  };

  const updateAccount = async (id: string, accountData: Partial<Account>) => {
    // Update level if code has changed
    let dataToUpdate = { ...accountData };
    if (accountData.code) {
      dataToUpdate.level = accountData.code.split('.').length;
    }
    dataToUpdate.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from("accounting_accounts")
      .update(dataToUpdate)
      .eq("id", id)
      .select();

    if (error) throw error;

    // Invalidate and refetch accounts
    await queryClient.invalidateQueries({ queryKey: ["accounting_accounts"] });
    
    return data;
  };

  const deleteAccount = async (id: string) => {
    // Check if there are dependent accounts
    const { data: dependentAccounts, error: checkError } = await supabase
      .from("accounting_accounts")
      .select("id")
      .eq("parent_id", id);

    if (checkError) throw checkError;

    // Don't delete if there are dependent accounts
    if (dependentAccounts && dependentAccounts.length > 0) {
      throw new Error("لا يمكن حذف الحساب لأنه يحتوي على حسابات فرعية");
    }

    // Check if the account is used in journal entries
    const { data: journalItems, error: journalError } = await supabase
      .from("accounting_journal_items")
      .select("id")
      .eq("account_id", id)
      .limit(1);

    if (journalError) throw journalError;

    // Don't delete if the account is used in journal entries
    if (journalItems && journalItems.length > 0) {
      throw new Error("لا يمكن حذف الحساب لأنه مستخدم في القيود المحاسبية");
    }

    // If all checks pass, delete the account
    const { error } = await supabase
      .from("accounting_accounts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Invalidate and refetch accounts
    await queryClient.invalidateQueries({ queryKey: ["accounting_accounts"] });
    
    return true;
  };

  const toggleAccountStatus = async (id: string, isActive: boolean) => {
    const { data, error } = await supabase
      .from("accounting_accounts")
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    // Invalidate and refetch accounts
    await queryClient.invalidateQueries({ queryKey: ["accounting_accounts"] });
    
    return data;
  };

  return {
    createAccount,
    updateAccount,
    deleteAccount,
    toggleAccountStatus,
  };
};


import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AccountCard } from "./AccountCard";
import { EmptyState } from "./EmptyState";

interface Account {
  id: string;
  platform_name: string;
  account_name: string;
  username: string;
  password?: string;
  website_url?: string;
  responsible_person?: string;
  renewal_date?: string;
  notes?: string;
  category: string;
  access_level: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
  creator?: { display_name?: string; email?: string; };
}

interface AccountsListProps {
  category: "all" | "social" | "apps" | "email" | "financial" | string;
}

export const AccountsList = ({ category }: AccountsListProps) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, [category]);

  useEffect(() => {
    filterAccounts();
  }, [searchTerm, accounts]);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("digital_accounts")
        .select(`
          *,
          creator:created_by (display_name, email)
        `)
        .order("platform_name", { ascending: true });

      if (category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("حدث خطأ أثناء تحميل الحسابات");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAccounts = () => {
    if (!searchTerm.trim()) {
      setFilteredAccounts(accounts);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = accounts.filter((account) => 
      account.platform_name.toLowerCase().includes(term) ||
      account.account_name.toLowerCase().includes(term) ||
      account.username.toLowerCase().includes(term) ||
      (account.responsible_person && account.responsible_person.toLowerCase().includes(term))
    );

    setFilteredAccounts(filtered);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("digital_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setAccounts(prev => prev.filter(account => account.id !== id));
      toast.success("تم حذف الحساب بنجاح");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("حدث خطأ أثناء حذف الحساب");
    }
  };

  const handleUpdate = (updatedAccount: Account) => {
    setAccounts(prev => 
      prev.map(account => 
        account.id === updatedAccount.id ? updatedAccount : account
      )
    );
  };

  if (isLoading) {
    return (
      <div className="mt-4 text-center py-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="البحث في الحسابات..."
          className="pl-10 pr-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredAccounts.length === 0 ? (
        <EmptyState
          message={
            searchTerm
              ? "لا توجد نتائج مطابقة لبحثك"
              : "لا توجد حسابات بعد. أضف حسابك الأول!"
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onDelete={() => handleDelete(account.id)}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

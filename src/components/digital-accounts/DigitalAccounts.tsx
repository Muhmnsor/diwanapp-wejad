
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AccountsList } from "./AccountsList";
import { AccountDialog } from "./AccountDialog";

export interface DigitalAccount {
  id: string;
  platform: string;
  username: string;
  password?: string;
  has_password: boolean;
  notes?: string;
  created_at: string;
}

export const DigitalAccounts = () => {
  const [accounts, setAccounts] = useState<DigitalAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<DigitalAccount | null>(null);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('digital_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setAccounts(data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("حدث خطأ أثناء جلب الحسابات الرقمية");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleEdit = (account: DigitalAccount) => {
    setSelectedAccount(account);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('digital_accounts')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success("تم حذف الحساب بنجاح");
      fetchAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("حدث خطأ أثناء حذف الحساب");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedAccount(null);
  };

  const handleSuccess = () => {
    fetchAccounts();
    handleDialogClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">الحسابات الرقمية</h2>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-1">
          <Plus size={16} />
          <span>إضافة حساب</span>
        </Button>
      </div>
      
      <Card className="p-4">
        <AccountsList 
          accounts={accounts} 
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>
      
      <AccountDialog 
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        account={selectedAccount}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

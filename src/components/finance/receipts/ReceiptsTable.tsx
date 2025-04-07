import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Trash, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/utils/dateUtils";
import { toast } from "@/hooks/use-toast";
import { DeleteReceiptDialog } from "./DeleteReceiptDialog";
import { ReceiptViewDialog } from "./ReceiptViewDialog";

export const ReceiptsTable = () => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<{id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const { toast: showToast } = useToast();

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const { data: receiptsData, error: receiptsError } = await supabase
        .from("accounting_receipts")
        .select("*, account_id, cost_center_id");

      if (receiptsError) throw receiptsError;

      const { data: accountsData, error: accountsError } = await supabase
        .from("accounting_accounts")
        .select("id, name");

      if (accountsError) throw accountsError;

      setReceipts(receiptsData || []);
      setAccounts(accountsData || []);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      showToast({
        title: "حدث خطأ أثناء تحميل سندات القبض",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "غير محدد";
  };

  const handleDeleteClick = (receipt: any) => {
    setSelectedReceipt(receipt);
    setIsDeleteDialogOpen(true);
  };

  const handleViewClick = (receipt: any) => {
    setSelectedReceipt(receipt);
    setIsViewDialogOpen(true);
  };

  const deleteReceipt = async () => {
    if (!selectedReceipt) return;

    try {
      const { error } = await supabase
        .from("accounting_receipts")
        .delete()
        .eq("id", selectedReceipt.id);

      if (error) throw error;

      // Remove the receipt from the local state
      setReceipts(receipts.filter(receipt => receipt.id !== selectedReceipt.id));
      
      showToast({
        title: "تم حذف سند القبض بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting receipt:", error);
      showToast({
        title: "حدث خطأ أثناء حذف سند القبض",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedReceipt(null);
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'نقدي';
      case 'check': return 'شيك';
      case 'bank_transfer': return 'تحويل بنكي';
      default: return method;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'issued': return 'صادر';
      case 'cancelled': return 'ملغي';
      case 'voided': return 'ملغي';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600';
      case 'issued': return 'text-green-600';
      case 'cancelled': 
      case 'voided': 
        return 'text-red-600';
      default: return '';
    }
  };

  if (loading) {
    return <div className="text-center py-4">جاري التحميل...</div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الرقم</TableHead>
            <TableHead className="text-right">التاريخ</TableHead>
            <TableHead className="text-right">المبلغ</TableHead>
            <TableHead className="text-right">الدافع</TableHead>
            <TableHead className="text-right">طريقة الدفع</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                لا توجد سندات قبض مسجلة بعد
              </TableCell>
            </TableRow>
          ) : (
            receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell>{receipt.receipt_number}</TableCell>
                <TableCell>{formatDate(receipt.date)}</TableCell>
                <TableCell>{receipt.total_amount.toLocaleString()} ريال</TableCell>
                <TableCell>{receipt.payer_name}</TableCell>
                <TableCell>{getPaymentMethodText(receipt.payment_method)}</TableCell>
                <TableCell className={getStatusClass(receipt.status)}>
                  {getStatusText(receipt.status)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleViewClick(receipt)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleDeleteClick(receipt)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedReceipt && (
        <DeleteReceiptDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={deleteReceipt}
          receiptId={selectedReceipt.id}
          receiptNumber={selectedReceipt.receipt_number}
        />
      )}

      {selectedReceipt && (
        <ReceiptViewDialog
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          receipt={selectedReceipt}
          accounts={accounts}
        />
      )}
    </div>
  );
};


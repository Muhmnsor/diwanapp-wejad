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
import { Plus, Edit, Eye, Trash, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/utils/dateUtils";
import { toast } from "@/hooks/use-toast";
import { InvoiceDialog } from "./InvoiceDialog";
import { DeleteInvoiceDialog } from "./DeleteInvoiceDialog";

export const InvoicesTable = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast: showToast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("accounting_invoices")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvoices(data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      showToast({
        title: "حدث خطأ أثناء تحميل الفواتير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = () => {
    setSelectedInvoice(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEditClick = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    fetchInvoices();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInvoice) return;

    try {
      const { error } = await supabase
        .from("accounting_invoices")
        .delete()
        .eq("id", selectedInvoice.id);

      if (error) throw error;

      setInvoices(invoices.filter(invoice => invoice.id !== selectedInvoice.id));
      
      showToast({
        title: "تم حذف الفاتورة بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      showToast({
        title: "حدث خطأ أثناء حذف الفاتورة",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedInvoice(null);
    }
  };

  const getInvoiceTypeText = (type: string) => {
    switch (type) {
      case 'sale': return 'مبيعات';
      case 'purchase': return 'مشتريات';
      default: return type;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'issued': return 'صادرة';
      case 'paid': return 'مدفوعة';
      case 'partially_paid': return 'مدفوعة جزئياً';
      case 'cancelled': return 'ملغاة';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600';
      case 'issued': return 'text-blue-600';
      case 'paid': return 'text-green-600';
      case 'partially_paid': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      default: return '';
    }
  };

  if (loading) {
    return <div className="text-center py-4">جاري التحميل...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">قائمة الفواتير</h2>
        <Button onClick={handleOpenForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إضافة فاتورة جديدة</span>
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الرقم</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">العميل/المورد</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  لا توجد فواتير مسجلة بعد
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{formatDate(invoice.date)}</TableCell>
                  <TableCell>{invoice.customer_name}</TableCell>
                  <TableCell>{getInvoiceTypeText(invoice.invoice_type)}</TableCell>
                  <TableCell>{invoice.total_amount.toLocaleString()} ريال</TableCell>
                  <TableCell className={getStatusClass(invoice.status)}>
                    {getStatusText(invoice.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditClick(invoice)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => handleDeleteClick(invoice)}
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
      </div>

      {isFormOpen && (
        <InvoiceDialog
          isOpen={isFormOpen}
          onClose={handleFormCancel}
          onSubmit={handleFormSubmit}
          initialData={selectedInvoice}
          mode={isEditing ? "edit" : "create"}
        />
      )}

      {selectedInvoice && (
        <DeleteInvoiceDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          invoiceId={selectedInvoice.id}
          invoiceNumber={selectedInvoice.invoice_number}
        />
      )}
    </div>
  );
};


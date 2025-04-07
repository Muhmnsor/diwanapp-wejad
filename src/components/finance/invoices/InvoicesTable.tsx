import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Filter, Download, Eye, Edit, Trash, FileSearch } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { InvoiceDialog } from "./InvoiceDialog";
import { InvoicePreviewDialog } from "./InvoicePreviewDialog";
import { DeleteInvoiceDialog } from "./DeleteInvoiceDialog";

interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  customer_name: string;
  invoice_type: string;
  total_amount: number;
  status: string;
}

export const InvoicesTable = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // جلب الفواتير
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('accounting_invoices')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء جلب الفواتير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // إنشاء فاتورة جديدة
  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setOpenDialog(true);
  };

  // تعديل فاتورة موجودة
  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setOpenDialog(true);
  };

  // عرض تفاصيل الفاتورة
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setOpenPreviewDialog(true);
  };

  // حذف فاتورة
  const handleDeleteInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setOpenDeleteDialog(true);
  };

  // تحويل حالة الفاتورة إلى نص بالعربية
  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'pending': return 'في انتظار الدفع';
      case 'paid': return 'مدفوعة';
      case 'cancelled': return 'ملغاة';
      default: return status;
    }
  };

  // تحويل نوع الفاتورة إلى نص بالعربية
  const getTypeText = (type: string) => {
    switch (type) {
      case 'sales': return 'مبيعات';
      case 'purchase': return 'مشتريات';
      default: return type;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button onClick={handleCreateInvoice} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>إنشاء فاتورة جديدة</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>تصفية</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>تصدير</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-10">
            <FileSearch className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">لا توجد فواتير</h3>
            <p className="text-muted-foreground">قم بإنشاء فاتورة جديدة للبدء</p>
          </div>
        ) : (
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الفاتورة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                <TableHead className="text-right">العميل/المورد</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>{new Date(invoice.due_date).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>{invoice.customer_name}</TableCell>
                  <TableCell>{getTypeText(invoice.invoice_type)}</TableCell>
                  <TableCell>{invoice.total_amount.toLocaleString('ar-SA')} ريال</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditInvoice(invoice)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteInvoice(invoice)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* نافذة إنشاء/تعديل الفاتورة */}
      <InvoiceDialog 
        open={openDialog} 
        onOpenChange={setOpenDialog} 
        invoice={selectedInvoice}
        onSuccess={fetchInvoices}
      />

      {/* نافذة عرض الفاتورة */}
      <InvoicePreviewDialog 
        open={openPreviewDialog} 
        onOpenChange={setOpenPreviewDialog} 
        invoice={selectedInvoice}
      />

      {/* نافذة حذف الفاتورة */}
      <DeleteInvoiceDialog 
        open={openDeleteDialog} 
        onOpenChange={setOpenDeleteDialog} 
        invoice={selectedInvoice}
        onSuccess={fetchInvoices}
      />
    </Card>
  );
};


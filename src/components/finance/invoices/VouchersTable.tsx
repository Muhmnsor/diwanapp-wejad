import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Filter, Download, Eye, Edit, Trash, FileSearch } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { VoucherDialog } from "./VoucherDialog";
import { VoucherPreviewDialog } from "./VoucherPreviewDialog";
import { DeleteVoucherDialog } from "./DeleteVoucherDialog";

interface Voucher {
  id: string;
  voucher_number: string;
  date: string;
  beneficiary_name: string;
  voucher_type: string;
  total_amount: number;
  status: string;
  payment_method: string;
}

export const VouchersTable = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // جلب سندات الصرف
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('accounting_payment_vouchers')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      
      setVouchers(data || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء جلب سندات الصرف",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // إنشاء سند صرف جديد
  const handleCreateVoucher = () => {
    setSelectedVoucher(null);
    setOpenDialog(true);
  };

  // تعديل سند صرف موجود
  const handleEditVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setOpenDialog(true);
  };

  // عرض تفاصيل سند الصرف
  const handleViewVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setOpenPreviewDialog(true);
  };

  // حذف سند صرف
  const handleDeleteVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setOpenDeleteDialog(true);
  };

  // تحويل حالة السند إلى نص بالعربية
  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغى';
      default: return status;
    }
  };

  // تحويل نوع السند إلى نص بالعربية
  const getTypeText = (type: string) => {
    switch (type) {
      case 'expense': return 'مصروفات';
      case 'revenue': return 'إيرادات';
      default: return type;
    }
  };

  // تحويل طريقة الدفع إلى نص بالعربية
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'نقدي';
      case 'bank_transfer': return 'تحويل بنكي';
      case 'check': return 'شيك';
      default: return method;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button onClick={handleCreateVoucher} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>إنشاء سند جديد</span>
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
        ) : vouchers.length === 0 ? (
          <div className="text-center py-10">
            <FileSearch className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">لا توجد سندات صرف</h3>
            <p className="text-muted-foreground">قم بإنشاء سند صرف جديد للبدء</p>
          </div>
        ) : (
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم السند</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">المستفيد</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">طريقة الدفع</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium">{voucher.voucher_number}</TableCell>
                  <TableCell>{new Date(voucher.date).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>{voucher.beneficiary_name}</TableCell>
                  <TableCell>{getTypeText(voucher.voucher_type)}</TableCell>
                  <TableCell>{getPaymentMethodText(voucher.payment_method)}</TableCell>
                  <TableCell>{voucher.total_amount.toLocaleString('ar-SA')} ريال</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      voucher.status === 'completed' ? 'bg-green-100 text-green-800' :
                      voucher.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(voucher.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewVoucher(voucher)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditVoucher(voucher)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteVoucher(voucher)}
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

      {/* نافذة إنشاء/تعديل سند الصرف */}
      <VoucherDialog 
        open={openDialog} 
        onOpenChange={setOpenDialog} 
        voucher={selectedVoucher}
        onSuccess={fetchVouchers}
      />

      {/* نافذة عرض سند الصرف */}
      <VoucherPreviewDialog 
        open={openPreviewDialog} 
        onOpenChange={setOpenPreviewDialog} 
        voucher={selectedVoucher}
      />

      {/* نافذة حذف سند الصرف */}
      <DeleteVoucherDialog 
        open={openDeleteDialog} 
        onOpenChange={setOpenDeleteDialog} 
        voucher={selectedVoucher}
        onSuccess={fetchVouchers}
      />
    </Card>
  );
};


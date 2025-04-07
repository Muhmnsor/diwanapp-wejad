import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useVouchers, Voucher } from "@/hooks/accounting/useVouchers";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { DeleteVoucherDialog } from "./DeleteVoucherDialog";
import { VoucherViewDialog } from "./VoucherViewDialog";

interface VouchersTableProps {
  onEditVoucher: (voucher: Voucher) => void;
}

export const VouchersTable = ({ onEditVoucher }: VouchersTableProps) => {
  const { vouchers, isLoading } = useVouchers();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const handleViewVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setViewDialogOpen(true);
  };

  const handleDeleteVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">مسودة</Badge>;
      case "approved":
        return <Badge variant="secondary">معتمد</Badge>;
      case "paid":
        return <Badge variant="success">مدفوع</Badge>;
      case "cancelled":
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "نقدي";
      case "bank_transfer":
        return "تحويل بنكي";
      case "check":
        return "شيك";
      case "credit_card":
        return "بطاقة ائتمان";
      default:
        return method;
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">جاري تحميل البيانات...</div>;
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم السند</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">المستفيد</TableHead>
              <TableHead className="text-right">طريقة الدفع</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24">
                  لا توجد سندات صرف
                </TableCell>
              </TableRow>
            )}
            {vouchers.map((voucher) => (
              <TableRow key={voucher.id}>
                <TableCell className="font-medium">{voucher.voucher_number}</TableCell>
                <TableCell>
                  {voucher.voucher_type === "expense" ? "مصروفات" : "دفعات"}
                </TableCell>
                <TableCell>{format(new Date(voucher.date), "yyyy/MM/dd")}</TableCell>
                <TableCell>{voucher.beneficiary_name}</TableCell>
                <TableCell>{getPaymentMethodLabel(voucher.payment_method)}</TableCell>
                <TableCell>{formatCurrency(voucher.total_amount)}</TableCell>
                <TableCell>{getStatusBadge(voucher.status)}</TableCell>
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
                      onClick={() => onEditVoucher(voucher)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteVoucher(voucher)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedVoucher && (
        <>
          <DeleteVoucherDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            voucher={selectedVoucher}
          />
          <VoucherViewDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            voucher={selectedVoucher}
          />
        </>
      )}
    </>
  );
};


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
import { useReceipts, Receipt } from "@/hooks/accounting/useReceipts";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { DeleteReceiptDialog } from "./DeleteReceiptDialog";
import { ReceiptViewDialog } from "./ReceiptViewDialog";

interface ReceiptsTableProps {
  onEditReceipt: (receipt: Receipt) => void;
}

export const ReceiptsTable = ({ onEditReceipt }: ReceiptsTableProps) => {
  const { receipts, isLoading } = useReceipts();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setViewDialogOpen(true);
  };

  const handleDeleteReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">مسودة</Badge>;
      case "final":
        return <Badge variant="success">نهائي</Badge>;
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
              <TableHead className="text-right">المدفوع له</TableHead>
              <TableHead className="text-right">طريقة الدفع</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24">
                  لا توجد سندات قبض
                </TableCell>
              </TableRow>
            )}
            {receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell className="font-medium">{receipt.receipt_number}</TableCell>
                <TableCell>
                  {receipt.receipt_type === "revenue" ? "إيرادات" : "استرداد"}
                </TableCell>
                <TableCell>{format(new Date(receipt.date), "yyyy/MM/dd")}</TableCell>
                <TableCell>{receipt.payer_name}</TableCell>
                <TableCell>{getPaymentMethodLabel(receipt.payment_method)}</TableCell>
                <TableCell>{formatCurrency(receipt.total_amount)}</TableCell>
                <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewReceipt(receipt)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditReceipt(receipt)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteReceipt(receipt)}
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

      {selectedReceipt && (
        <>
          <DeleteReceiptDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            receipt={selectedReceipt}
          />
          <ReceiptViewDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            receipt={selectedReceipt}
          />
        </>
      )}
    </>
  );
};


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
import { Pencil, Trash2, Eye, FileText } from "lucide-react";
import { useInvoices, Invoice } from "@/hooks/accounting/useInvoices";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { DeleteInvoiceDialog } from "./DeleteInvoiceDialog";
import { InvoiceViewDialog } from "./InvoiceViewDialog";

interface InvoicesTableProps {
  onEditInvoice: (invoice: Invoice) => void;
}

export const InvoicesTable = ({ onEditInvoice }: InvoicesTableProps) => {
  const { invoices, isLoading } = useInvoices();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">مسودة</Badge>;
      case "sent":
        return <Badge variant="secondary">مرسلة</Badge>;
      case "paid":
        return <Badge variant="success">مدفوعة</Badge>;
      case "cancelled":
        return <Badge variant="destructive">ملغاة</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
              <TableHead className="text-right">رقم الفاتورة</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  لا توجد فواتير
                </TableCell>
              </TableRow>
            )}
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell>
                  {invoice.invoice_type === "sales" ? "مبيعات" : "مشتريات"}
                </TableCell>
                <TableCell>{format(new Date(invoice.date), "yyyy/MM/dd")}</TableCell>
                <TableCell>{invoice.customer_name}</TableCell>
                <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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
                      onClick={() => onEditInvoice(invoice)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteInvoice(invoice)}
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

      {selectedInvoice && (
        <>
          <DeleteInvoiceDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            invoice={selectedInvoice}
          />
          <InvoiceViewDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            invoice={selectedInvoice}
          />
        </>
      )}
    </>
  );
};


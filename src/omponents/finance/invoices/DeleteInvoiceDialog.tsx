import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface DeleteInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any | null;
  onSuccess: () => void;
}

export const DeleteInvoiceDialog = ({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: DeleteInvoiceDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!invoice) return;

    setIsDeleting(true);
    try {
      // التحقق من وجود قيود مرتبطة
      const { data: journalEntries, error: journalError } = await supabase
        .from('accounting_journal_entries')
        .select('id')
        .eq('invoice_id', invoice.id);

      if (journalError) throw journalError;

      // إذا كان هناك قيود مرتبطة، يجب تحديثها أولا لإلغاء الارتباط
      if (journalEntries && journalEntries.length > 0) {
        const { error: updateError } = await supabase
          .from('accounting_journal_entries')
          .update({ 
            invoice_id: null,
            is_invoice_entry: false
          })
          .eq('invoice_id', invoice.id);

        if (updateError) throw updateError;
      }

      // حذف الفاتورة
      const { error: deleteError } = await supabase
        .from('accounting_invoices')
        .delete()
        .eq('id', invoice.id);

      if (deleteError) throw deleteError;

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الفاتورة بنجاح",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "خطأ في الحذف",
        description: "تعذر حذف الفاتورة. الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>حذف الفاتورة</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من رغبتك في حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.
            {invoice?.status === 'paid' && (
              <div className="mt-2 text-amber-600 font-semibold">
                تنبيه: هذه الفاتورة مدفوعة وقد تكون مرتبطة بقيود محاسبية. سيؤدي الحذف إلى فصل هذه الارتباطات.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "جارٍ الحذف..." : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Voucher, useVouchers } from "@/hooks/accounting/useVouchers";
import { useState } from "react";

interface DeleteVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: Voucher;
}

export const DeleteVoucherDialog = ({
  open,
  onOpenChange,
  voucher,
}: DeleteVoucherDialogProps) => {
  const { deleteVoucher } = useVouchers();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteVoucher.mutateAsync(voucher.id!);
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting voucher:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">حذف سند الصرف</DialogTitle>
          <DialogDescription className="text-right">
            هل أنت متأكد من رغبتك في حذف سند الصرف رقم {voucher.voucher_number}؟ هذا الإجراء لا يمكن التراجع عنه.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "جاري الحذف..." : "حذف"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


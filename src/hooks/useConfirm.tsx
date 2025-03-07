
import { useState } from "react";
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

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export const useConfirm = () => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    description: "",
    confirmText: "تأكيد",
    cancelText: "إلغاء",
  });
  const [resolver, setResolver] = useState<(value: boolean) => void>(() => () => {});

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    setOptions({ ...options });
    setOpen(true);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    resolver(true);
    setOpen(false);
  };

  const handleCancel = () => {
    resolver(false);
    setOpen(false);
  };

  const ConfirmationDialog = () => (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          <AlertDialogDescription>{options.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse sm:justify-start">
          <AlertDialogAction onClick={handleConfirm}>{options.confirmText}</AlertDialogAction>
          <AlertDialogCancel onClick={handleCancel}>{options.cancelText}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    confirm,
    ConfirmationDialog,
  };
};

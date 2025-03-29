
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Template } from "./types/template";

interface DeleteTemplateDialogProps {
  template: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export const DeleteTemplateDialog = ({
  template,
  open,
  onOpenChange,
  onDelete,
}: DeleteTemplateDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">حذف النموذج</DialogTitle>
          <DialogDescription className="text-destructive">
            هذا الإجراء لا يمكن التراجع عنه.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4">
            هل أنت متأكد من رغبتك في حذف النموذج التالي؟
          </p>
          <div className="bg-muted p-3 rounded-md">
            <p className="font-medium">{template.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {template.department} | رقم النموذج: {template.template_number}
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
          >
            حذف النموذج
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

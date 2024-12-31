import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const ProjectConfirmationHeader = () => {
  return (
    <DialogHeader className="space-y-2">
      <DialogTitle className="text-center">تم التسجيل بنجاح!</DialogTitle>
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <div>سيتم التواصل معك قريباً</div>
        <div className="font-medium">يرجى حفظ هذا التأكيد أو تصويره قبل الإغلاق</div>
      </div>
    </DialogHeader>
  );
};
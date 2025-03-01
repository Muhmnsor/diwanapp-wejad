
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface ExportDialogFooterProps {
  onClose: () => void;
  onExport: () => void;
  isExporting: boolean;
}

export const ExportDialogFooter: React.FC<ExportDialogFooterProps> = ({
  onClose,
  onExport,
  isExporting
}) => {
  return (
    <DialogFooter className="sm:justify-start">
      <Button 
        variant="outline" 
        onClick={onClose}
        className="mr-auto"
      >
        إلغاء
      </Button>
      <Button 
        type="submit" 
        onClick={onExport}
        disabled={isExporting}
      >
        {isExporting ? "جاري التصدير..." : "تصدير التقرير"}
      </Button>
    </DialogFooter>
  );
};

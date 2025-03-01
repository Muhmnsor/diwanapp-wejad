
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FileDown, Loader2 } from "lucide-react";

interface ExportDialogFooterProps {
  isExporting: boolean;
  onCancel: () => void;
  onExport: () => Promise<void>;
}

export const ExportDialogFooter = ({
  isExporting,
  onCancel,
  onExport,
}: ExportDialogFooterProps) => {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onCancel} disabled={isExporting}>
        إلغاء
      </Button>
      <Button onClick={onExport} disabled={isExporting}>
        {isExporting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري التصدير...
          </>
        ) : (
          <>
            <FileDown className="mr-2 h-4 w-4" />
            تصدير
          </>
        )}
      </Button>
    </DialogFooter>
  );
};

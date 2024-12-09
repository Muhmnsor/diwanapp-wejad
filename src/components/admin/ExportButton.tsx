import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  onClick: () => void;
  isExporting: boolean;
  disabled: boolean;
}

export const ExportButton = ({ onClick, isExporting, disabled }: ExportButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isExporting || disabled}
    >
      <Download className="ml-2 h-4 w-4" />
      {isExporting ? "جاري التصدير..." : "تصدير إلى Excel"}
    </Button>
  );
};
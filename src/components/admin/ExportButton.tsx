import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

interface ExportButtonProps {
  data: any[];
  filename: string;
}

export const ExportButton = ({ data, filename }: ExportButtonProps) => {
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={!data?.length}
    >
      <Download className="ml-2 h-4 w-4" />
      تصدير إلى Excel
    </Button>
  );
};
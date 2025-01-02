import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Edit, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Report } from "@/types/report";

interface ReportTableRowProps {
  report: Report;
}

export const ReportTableRow = ({ report }: ReportTableRowProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <tr key={report.id}>
      <td className="px-4 py-2">{report.report_name}</td>
      <td className="px-4 py-2">{report.program_name}</td>
      <td className="px-4 py-2">
        {format(new Date(report.created_at), 'PPP', { locale: ar })}
      </td>
      <td className="px-4 py-2">
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </td>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل التقرير</DialogTitle>
          </DialogHeader>
          {/* Edit form will be implemented later */}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف التقرير</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteOpen(false)}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </tr>
  );
};
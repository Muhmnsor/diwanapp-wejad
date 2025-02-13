
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectReportActions } from "./ProjectReportActions";

interface ReportsTableProps {
  reports: any[];
  isLoading: boolean;
  onEdit: (report: any) => void;
  onDelete: (report: any) => void;
  onDownload: (report: any) => void;
  isDeleting: boolean;
  selectedReport: any;
  formatDate: (date: string) => string;
}

export const ReportsTable = ({
  reports,
  isLoading,
  onEdit,
  onDelete,
  onDownload,
  isDeleting,
  selectedReport,
  formatDate,
}: ReportsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">معد التقرير</TableHead>
            <TableHead className="text-center">النشاط</TableHead>
            <TableHead className="text-center">عدد الحضور</TableHead>
            <TableHead className="text-center">تاريخ الإنشاء</TableHead>
            <TableHead className="text-center">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                جاري التحميل...
              </TableCell>
            </TableRow>
          ) : reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                لا توجد تقارير بعد
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report: any) => (
              <TableRow key={report.id}>
                <TableCell className="text-center font-medium">
                  {report.author_name || 'غير محدد'}
                </TableCell>
                <TableCell className="text-center">
                  {report.events?.title || 'النشاط غير موجود'}
                </TableCell>
                <TableCell className="text-center">{report.attendees_count}</TableCell>
                <TableCell className="text-center">
                  {new Date(report.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </TableCell>
                <TableCell className="text-center">
                  <ProjectReportActions
                    onEdit={() => onEdit(report)}
                    onDelete={() => onDelete(report)}
                    onDownload={() => onDownload(report)}
                    isDeleting={isDeleting && selectedReport?.id === report.id}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

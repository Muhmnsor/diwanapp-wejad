
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
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-center py-4 text-gray-700 font-semibold">معد التقرير</TableHead>
            <TableHead className="text-center py-4 text-gray-700 font-semibold">النشاط</TableHead>
            <TableHead className="text-center py-4 text-gray-700 font-semibold">عدد الحضور</TableHead>
            <TableHead className="text-center py-4 text-gray-700 font-semibold">تاريخ الإنشاء</TableHead>
            <TableHead className="text-center py-4 text-gray-700 font-semibold">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  جاري التحميل...
                </div>
              </TableCell>
            </TableRow>
          ) : reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                <div>لا توجد تقارير بعد</div>
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report: any) => (
              <TableRow 
                key={report.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="text-center py-4 text-gray-700">
                  {report.profiles?.email || 'غير معروف'}
                </TableCell>
                <TableCell className="text-center py-4 text-gray-700">
                  {report.events?.title || 'النشاط غير موجود'}
                </TableCell>
                <TableCell className="text-center py-4 text-gray-700">
                  {report.attendees_count}
                </TableCell>
                <TableCell className="text-center py-4 text-gray-700">
                  {formatDate(report.created_at)}
                </TableCell>
                <TableCell className="text-center py-4">
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

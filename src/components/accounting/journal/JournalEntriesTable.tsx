
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, FileText, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useJournalEntries } from "@/hooks/accounting/useJournalEntries";

interface JournalEntriesTableProps {
  onEditEntry: (entry: any) => void;
}

export const JournalEntriesTable = ({ onEditEntry }: JournalEntriesTableProps) => {
  const { entries, isLoading, error } = useJournalEntries();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            مسودة
          </Badge>
        );
      case 'posted':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            مرحل
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            ملغى
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-red-500">حدث خطأ أثناء تحميل البيانات</p>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <p className="text-muted-foreground mb-4">لا توجد قيود محاسبية بعد</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الرقم المرجعي</TableHead>
            <TableHead className="text-right">التاريخ</TableHead>
            <TableHead className="text-right">الوصف</TableHead>
            <TableHead className="text-right">المبلغ</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.reference_number}</TableCell>
              <TableCell>{formatDate(entry.date)}</TableCell>
              <TableCell>{entry.description}</TableCell>
              <TableCell>{entry.total_amount?.toFixed(2) || '0.00'} ريال</TableCell>
              <TableCell>{getStatusBadge(entry.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEditEntry(entry)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


import { formatDate } from "@/utils/dateUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Obligation } from "./hooks/useObligationsData";

interface ObligationsTableProps {
  obligations: Obligation[];
  loading: boolean;
}

export const ObligationsTable = ({ obligations, loading }: ObligationsTableProps) => {
  if (loading) {
    return <div className="text-center p-4">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="border rounded-md">
      {obligations.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          لا توجد التزامات مالية مضافة حتى الآن
        </div>
      ) : (
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead>الرقم</TableHead>
              <TableHead>مبلغ الالتزام</TableHead>
              <TableHead>الإيضاح</TableHead>
              <TableHead>المصدر</TableHead>
              <TableHead>تاريخ المورد</TableHead>
              <TableHead>مبلغ المورد</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {obligations.map((obligation, index) => (
              <TableRow key={obligation.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{obligation.amount.toLocaleString()} ريال</TableCell>
                <TableCell>{obligation.description || "—"}</TableCell>
                <TableCell>{obligation.resource_source}</TableCell>
                <TableCell>{formatDate(obligation.resource_date)}</TableCell>
                <TableCell>{obligation.resource_total_amount.toLocaleString()} ريال</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

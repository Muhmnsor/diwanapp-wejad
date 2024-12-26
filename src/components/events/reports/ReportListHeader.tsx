import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ReportListHeaderProps {
  title: string;
}

export const ReportListHeader = ({ title }: ReportListHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>اسم الفعالية</TableHead>
        <TableHead>تاريخ الإعداد</TableHead>
        <TableHead className="text-left">الإجراءات</TableHead>
      </TableRow>
    </TableHeader>
  );
};
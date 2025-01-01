import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const FeedbackTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="text-right">التقييم العام</TableHead>
        <TableHead className="text-right">تقييم المحتوى</TableHead>
        <TableHead className="text-right">تقييم التنظيم</TableHead>
        <TableHead className="text-right">تقييم المقدم</TableHead>
      </TableRow>
    </TableHeader>
  );
};
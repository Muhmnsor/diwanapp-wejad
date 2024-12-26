import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportListContainerProps {
  isLoading?: boolean;
  error?: Error | null;
  children: {
    header: React.ReactNode;
    rows: React.ReactNode;
  };
}

export const ReportListContainer = ({ isLoading, error, children }: ReportListContainerProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error in ReportListContainer:', error);
    return (
      <div className="text-red-500 p-4 text-center">
        حدث خطأ أثناء تحميل التقارير
      </div>
    );
  }

  return (
    <div className="rounded-md border" dir="rtl">
      <Table>
        {children.header}
        <TableBody>
          {children.rows}
        </TableBody>
      </Table>
    </div>
  );
};
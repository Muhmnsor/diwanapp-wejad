import { Table, TableBody } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportListContainerProps {
  isLoading?: boolean;
  error?: Error | null;
  children: React.ReactNode;
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

  if (!children) {
    return (
      <div className="text-gray-500 p-4 text-center">
        لا توجد تقارير سابقة
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table dir="rtl">
        <TableBody>
          {children}
        </TableBody>
      </Table>
    </div>
  );
};
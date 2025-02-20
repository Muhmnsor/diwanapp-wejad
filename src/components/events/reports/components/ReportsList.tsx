
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReportsListProps {
  eventId: string;
}

export const ReportsList = ({ eventId }: ReportsListProps) => {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["event-reports", eventId],
    queryFn: async () => {
      console.log("Fetching reports for event:", eventId); // تسجيل معرف الفعالية

      const { data, error } = await supabase
        .from("event_reports")
        .select(`
          *,
          profiles:executor_id (
            email
          )
        `)
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reports:", error); // تسجيل أي خطأ في جلب التقارير
        throw error;
      }

      console.log("Fetched reports:", data); // تسجيل التقارير التي تم جلبها
      return data || [];
    },
  });

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-hidden border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-center py-4 text-gray-700 font-semibold">معد التقرير</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">اسم التقرير</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">تاريخ الإنشاء</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="text-gray-500">لا توجد تقارير بعد</div>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => {
                console.log("Rendering report:", { 
                  id: report.id, 
                  executor_id: report.executor_id,
                  profiles: report.profiles 
                }); // تسجيل معلومات كل تقرير

                return (
                  <TableRow 
                    key={report.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="text-center py-4 text-gray-700">
                      {report.profiles?.email || "غير معروف"}
                    </TableCell>
                    <TableCell className="text-center py-4 text-gray-700">
                      {report.report_name}
                    </TableCell>
                    <TableCell className="text-center py-4 text-gray-700">
                      {format(new Date(report.created_at), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

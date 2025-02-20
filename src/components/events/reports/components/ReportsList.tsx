
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
      const { data, error } = await supabase
        .from("event_reports")
        .select(`
          *,
          executor:executor_id (
            email
          )
        `)
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="mt-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>معد التقرير</TableHead>
            <TableHead>اسم التقرير</TableHead>
            <TableHead>تاريخ الإنشاء</TableHead>
            <TableHead>إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{report.executor?.email || "غير معروف"}</TableCell>
              <TableCell>{report.report_name}</TableCell>
              <TableCell>{format(new Date(report.created_at), "yyyy-MM-dd")}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReportForm } from "../reports/ReportForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DashboardReportsTabProps {
  projectId: string;
}

export const DashboardReportsTab = ({ projectId }: DashboardReportsTabProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['project-reports', projectId],
    queryFn: async () => {
      console.log("Fetching reports for project:", projectId);
      const { data, error } = await supabase
        .from('project_activity_reports')
        .select(`
          *,
          events:activity_id (
            title
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching reports:", error);
        throw error;
      }

      console.log("Fetched reports:", data);
      return data || [];
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">تقارير النشاط</h2>
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة تقرير
        </Button>
      </div>

      {isFormOpen && <ReportForm projectId={projectId} />}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">اسم التقرير</TableHead>
              <TableHead className="text-right">النشاط</TableHead>
              <TableHead className="text-right">عدد الحضور</TableHead>
              <TableHead className="text-right">تاريخ الإنشاء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  لا توجد تقارير بعد
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    {report.report_name}
                  </TableCell>
                  <TableCell>
                    {report.events?.title || 'النشاط غير موجود'}
                  </TableCell>
                  <TableCell>{report.attendees_count}</TableCell>
                  <TableCell>{formatDate(report.created_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
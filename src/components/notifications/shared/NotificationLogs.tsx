import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface NotificationLogsProps {
  eventId?: string;
  projectId?: string;
}

export const NotificationLogs = ({ eventId, projectId }: NotificationLogsProps) => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['notification-logs', eventId, projectId],
    queryFn: async () => {
      console.log('Fetching notification logs for:', { eventId, projectId });
      
      const query = supabase
        .from('notification_logs')
        .select(`
          *,
          registrations (
            arabic_name,
            phone
          ),
          whatsapp_templates (
            name
          )
        `)
        .order('sent_at', { ascending: false });

      if (eventId) {
        query.eq('event_id', eventId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="text-center py-4">جاري تحميل السجلات...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">سجل الإشعارات</h3>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">المستلم</TableHead>
            <TableHead className="text-right">رقم الجوال</TableHead>
            <TableHead className="text-right">نوع الإشعار</TableHead>
            <TableHead className="text-right">القالب</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">تاريخ الإرسال</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs?.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.registrations?.arabic_name}</TableCell>
              <TableCell>{log.registrations?.phone}</TableCell>
              <TableCell>{log.notification_type}</TableCell>
              <TableCell>{log.whatsapp_templates?.name}</TableCell>
              <TableCell>{log.status}</TableCell>
              <TableCell>{format(new Date(log.sent_at), 'yyyy-MM-dd HH:mm')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
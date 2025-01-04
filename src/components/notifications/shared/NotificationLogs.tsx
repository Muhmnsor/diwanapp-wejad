import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface NotificationLogsProps {
  eventId?: string;
  projectId?: string;
}

export const NotificationLogs = ({ eventId, projectId }: NotificationLogsProps) => {
  const { data: logs, isLoading, error } = useQuery({
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
      if (projectId) {
        query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          حدث خطأ أثناء تحميل سجلات الإشعارات
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!logs?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد سجلات إشعارات حتى الآن
      </div>
    );
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
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.registrations?.arabic_name}</TableCell>
              <TableCell dir="ltr">{log.registrations?.phone}</TableCell>
              <TableCell>{log.notification_type}</TableCell>
              <TableCell>{log.whatsapp_templates?.name}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  log.status === 'sent' ? 'bg-green-100 text-green-800' :
                  log.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {log.status === 'sent' ? 'تم الإرسال' :
                   log.status === 'failed' ? 'فشل الإرسال' :
                   'قيد الانتظار'}
                </span>
              </TableCell>
              <TableCell>{format(new Date(log.sent_at), 'yyyy-MM-dd HH:mm')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
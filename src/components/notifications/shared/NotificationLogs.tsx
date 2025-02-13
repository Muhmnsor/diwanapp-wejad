import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NotificationLogsProps {
  eventId?: string;
  projectId?: string;
}

const StatusBadge = ({ status, errorDetails }: { status: string; errorDetails?: string }) => {
  switch (status) {
    case 'sent':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          تم الإرسال
        </Badge>
      );
    case 'failed':
      return (
        <Tooltip>
          <TooltipTrigger>
            <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
              <XCircle className="w-4 h-4 mr-1" />
              فشل الإرسال
            </Badge>
          </TooltipTrigger>
          {errorDetails && (
            <TooltipContent>
              <p className="max-w-xs">{errorDetails}</p>
            </TooltipContent>
          )}
        </Tooltip>
      );
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Clock className="w-4 h-4 mr-1" />
          قيد الانتظار
        </Badge>
      );
  }
};

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
    },
    refetchInterval: 30000 // Refresh every 30 seconds
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
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          لا توجد سجلات إشعارات حتى الآن
        </div>
      </Card>
    );
  }

  // Calculate statistics
  const stats = logs.reduce((acc, log) => {
    acc[log.status] = (acc[log.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">تم الإرسال</h4>
          <p className="text-2xl font-bold text-green-600">{stats.sent || 0}</p>
        </Card>
        <Card className="p-4 text-center">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">قيد الانتظار</h4>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
        </Card>
        <Card className="p-4 text-center">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">فشل الإرسال</h4>
          <p className="text-2xl font-bold text-red-600">{stats.failed || 0}</p>
        </Card>
      </div>
      
      <Card className="overflow-hidden">
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
                <TableCell>
                  <Badge variant="outline">
                    {log.notification_type === 'registration' && 'تسجيل'}
                    {log.notification_type === 'reminder' && 'تذكير'}
                    {log.notification_type === 'feedback' && 'تغذية راجعة'}
                    {log.notification_type === 'certificate' && 'شهادة'}
                    {log.notification_type === 'activity' && 'نشاط'}
                  </Badge>
                </TableCell>
                <TableCell>{log.whatsapp_templates?.name}</TableCell>
                <TableCell>
                  <StatusBadge status={log.status} errorDetails={log.error_details} />
                </TableCell>
                <TableCell>{format(new Date(log.sent_at), 'yyyy-MM-dd HH:mm')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
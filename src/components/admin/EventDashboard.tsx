import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Users, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  registration_number: string;
  created_at: string;
}

export const EventDashboard = ({ eventId }: { eventId: string }) => {
  const [isExporting, setIsExporting] = useState(false);

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      console.log('Fetching event details for dashboard:', eventId);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Fetch registrations
  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['registrations', eventId],
    queryFn: async () => {
      console.log('Fetching registrations for event:', eventId);
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;
      return data as Registration[];
    }
  });

  const exportToExcel = async () => {
    if (!registrations) return;
    
    setIsExporting(true);
    try {
      const exportData = registrations.map(reg => ({
        'رقم التسجيل': reg.registration_number,
        'الاسم': reg.name,
        'البريد الإلكتروني': reg.email,
        'رقم الجوال': reg.phone,
        'تاريخ التسجيل': new Date(reg.created_at).toLocaleString('ar-SA')
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "المسجلين");
      
      // Generate file name with event title and date
      const fileName = `المسجلين-${event?.title}-${new Date().toLocaleDateString('ar-SA')}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      toast.success("تم تصدير البيانات بنجاح");
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error("حدث خطأ أثناء تصدير البيانات");
    } finally {
      setIsExporting(false);
    }
  };

  if (eventLoading || registrationsLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  if (!event) {
    return <div className="text-center p-8">لم يتم العثور على الفعالية</div>;
  }

  const registrationCount = registrations?.length || 0;
  const remainingSeats = event.max_attendees - registrationCount;
  const occupancyRate = (registrationCount / event.max_attendees) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المسجلين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationCount}</div>
            <p className="text-xs text-muted-foreground">
              متبقي {remainingSeats} مقعد
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة الإشغال</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">موعد الفعالية</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.date}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {event.time}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>قائمة المسجلين</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            disabled={isExporting || !registrations?.length}
          >
            <Download className="ml-2 h-4 w-4" />
            {isExporting ? "جاري التصدير..." : "تصدير إلى Excel"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-right">رقم التسجيل</th>
                  <th className="p-2 text-right">الاسم</th>
                  <th className="p-2 text-right">البريد الإلكتروني</th>
                  <th className="p-2 text-right">رقم الجوال</th>
                  <th className="p-2 text-right">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {registrations?.map((reg) => (
                  <tr key={reg.id} className="border-b">
                    <td className="p-2">{reg.registration_number}</td>
                    <td className="p-2">{reg.name}</td>
                    <td className="p-2">{reg.email}</td>
                    <td className="p-2">{reg.phone}</td>
                    <td className="p-2">
                      {new Date(reg.created_at).toLocaleString('ar-SA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
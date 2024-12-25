import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Registration } from "./types";
import { DashboardOverview } from "./DashboardOverview";
import { DashboardRegistrations } from "./DashboardRegistrations";
import { Button } from "@/components/ui/button";
import { EventReportForm } from "../events/EventReportForm";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export const EventDashboard = ({ eventId }: { eventId: string }) => {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Fetch event details
  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      console.log('Fetching event details for dashboard:', eventId);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching event:', error);
        throw error;
      }

      if (!data) {
        console.error('Event not found:', eventId);
        throw new Error('لم يتم العثور على الفعالية');
      }

      return data;
    },
    retry: 3,
    retryDelay: 1000,
    meta: {
      onError: (error: Error) => {
        console.error('Error in event query:', error);
        toast.error(error.message || "حدث خطأ في تحميل بيانات الفعالية");
      }
    }
  });

  // Fetch registrations
  const { 
    data: registrations = [], 
    isLoading: registrationsLoading,
    error: registrationsError 
  } = useQuery({
    queryKey: ['registrations', eventId],
    queryFn: async () => {
      console.log('Fetching registrations for event:', eventId);
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching registrations:', error);
        throw error;
      }
      
      return (data || []) as Registration[];
    },
    retry: 3,
    retryDelay: 1000,
    meta: {
      onError: (error: Error) => {
        console.error('Error in registrations query:', error);
        toast.error("حدث خطأ في تحميل بيانات المسجلين");
      }
    }
  });

  if (eventLoading || registrationsLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  if (eventError || !event) {
    return <div className="text-center p-8 text-red-500">لم يتم العثور على الفعالية</div>;
  }

  const registrationCount = registrations?.length || 0;
  const remainingSeats = event.max_attendees - registrationCount;
  const occupancyRate = (registrationCount / event.max_attendees) * 100;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" dir="rtl">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="registrations">المسجلين</TabsTrigger>
          <TabsTrigger value="report">إضافة تقرير</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <DashboardOverview
            registrationCount={registrationCount}
            remainingSeats={remainingSeats}
            occupancyRate={occupancyRate}
            eventDate={event.date}
            eventTime={event.time}
          />
        </TabsContent>

        <TabsContent value="registrations">
          <DashboardRegistrations
            registrations={registrations}
            eventTitle={event.title}
          />
        </TabsContent>

        <TabsContent value="report">
          <Card>
            <CardContent className="pt-6">
              <EventReportForm 
                eventId={eventId}
                onSuccess={() => {
                  toast.success("تم إضافة التقرير بنجاح");
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

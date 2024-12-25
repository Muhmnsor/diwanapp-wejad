import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDetailsView } from "./EventDetailsView";
import { EventDashboard } from "@/components/admin/EventDashboard";
import { Event } from "@/store/eventStore";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EventReportDialog } from "./EventReportDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EventAdminViewProps {
  event: Event & { attendees: number };
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  onRegister: () => void;
  id: string;
}

export const EventAdminView = ({
  event,
  onEdit,
  onDelete,
  onAddToCalendar,
  onRegister,
  id
}: EventAdminViewProps) => {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const { data: userRoles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      console.log('Fetching user roles');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('roles (name)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }
      
      console.log('User roles:', data);
      return data.map(role => role.roles.name);
    }
  });

  const canAddReport = userRoles?.some(role => ['admin', 'event_executor'].includes(role));

  return (
    <Tabs defaultValue="details" className="mb-8">
      <TabsList className="mb-4">
        <TabsTrigger value="details">تفاصيل الفعالية</TabsTrigger>
        <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
      </TabsList>
      <TabsContent value="details">
        <div className="space-y-4">
          {canAddReport && (
            <div className="flex justify-end">
              <Button onClick={() => setIsReportDialogOpen(true)}>
                إضافة تقرير الفعالية
              </Button>
            </div>
          )}
          <EventDetailsView
            event={event}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddToCalendar={onAddToCalendar}
            onRegister={onRegister}
          />
        </div>
      </TabsContent>
      <TabsContent value="dashboard">
        <EventDashboard eventId={id} />
      </TabsContent>

      <EventReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        eventId={id}
      />
    </Tabs>
  );
};
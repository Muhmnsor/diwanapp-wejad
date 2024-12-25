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

  const { data: userRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Fetching roles for user:', user?.id);
      
      if (!user) {
        console.log('No authenticated user found');
        return [];
      }

      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name
          )
        `)
        .eq('user_id', user.id);

      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError);
        throw userRolesError;
      }

      const roles = userRolesData?.map(role => role.roles.name) || [];
      console.log('User roles:', roles);
      return roles;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  });

  const canAddReport = !rolesLoading && (
    userRoles.includes('admin') || 
    userRoles.includes('event_executor')
  );
  
  console.log('Can add report:', canAddReport, 'Roles loading:', rolesLoading);

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
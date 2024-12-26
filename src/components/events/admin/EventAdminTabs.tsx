import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event } from "@/store/eventStore";
import { EventDashboard } from "@/components/admin/EventDashboard";
import { EventDetailsContainer } from "../details/EventDetailsContainer";

interface EventAdminTabsProps {
  event: Event & { attendees: number };
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  onRegister: () => void;
  id: string;
  canAddReport: boolean;
  onAddReport: () => void;
  isAdmin: boolean;
}

export const EventAdminTabs = ({
  event,
  onEdit,
  onDelete,
  onAddToCalendar,
  onRegister,
  id,
  canAddReport,
  onAddReport,
  isAdmin,
}: EventAdminTabsProps) => {
  console.log('EventAdminTabs - Event:', event);
  console.log('EventAdminTabs - isAdmin:', isAdmin);
  console.log('EventAdminTabs - canAddReport:', canAddReport);

  return (
    <Tabs defaultValue="details" className="w-full" dir="rtl">
      <TabsList className="w-full justify-start border-b rounded-none">
        <TabsTrigger value="details">تفاصيل الفعالية</TabsTrigger>
        {isAdmin && <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="details" className="mt-0">
        <EventDetailsContainer
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddToCalendar={onAddToCalendar}
          onRegister={onRegister}
          id={id}
          isAdmin={isAdmin}
        />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="dashboard" className="mt-0">
          <EventDashboard eventId={id} />
        </TabsContent>
      )}
    </Tabs>
  );
};
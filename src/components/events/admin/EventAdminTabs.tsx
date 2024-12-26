import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDetailsView } from "../EventDetailsView";
import { EventDashboard } from "@/components/admin/EventDashboard";
import { Event } from "@/store/eventStore";

interface EventAdminTabsProps {
  event: Event & { attendees: number };
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  onRegister: () => void;
  id: string;
  canAddReport: boolean;
  onAddReport: () => void;
}

export const EventAdminTabs = ({
  event,
  onEdit,
  onDelete,
  onAddToCalendar,
  onRegister,
  id,
}: EventAdminTabsProps) => {
  console.log("EventAdminTabs rendering with event:", event);
  console.log("EventAdminTabs id:", id);

  return (
    <Tabs defaultValue="details" className="mb-8" dir="rtl">
      <TabsList className="mb-4 w-full justify-start">
        <TabsTrigger value="details">تفاصيل الفعالية</TabsTrigger>
        <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <EventDetailsView
          event={{
            ...event,
            max_attendees: event.max_attendees
          }}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddToCalendar={onAddToCalendar}
          onRegister={onRegister}
          id={id}
        />
      </TabsContent>
      
      <TabsContent value="dashboard">
        <EventDashboard eventId={id} />
      </TabsContent>
    </Tabs>
  );
};
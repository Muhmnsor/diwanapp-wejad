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
  console.log("EventAdminTabs rendering with event:", event);
  console.log("EventAdminTabs id:", id);
  console.log("EventAdminTabs isAdmin:", isAdmin);

  return (
    <Tabs defaultValue="details" className="mb-8" dir="rtl">
      <TabsList className="mb-4 w-full justify-start">
        <TabsTrigger value="details">تفاصيل الفعالية</TabsTrigger>
        {isAdmin && <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="details">
        <EventDetailsView
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddToCalendar={onAddToCalendar}
          onRegister={onRegister}
          id={id}
          canAddReport={canAddReport}
          onAddReport={onAddReport}
          isAdmin={isAdmin}
        />
      </TabsContent>
      
      {isAdmin && (
        <TabsContent value="dashboard">
          <EventDashboard eventId={id} />
        </TabsContent>
      )}
    </Tabs>
  );
};
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event } from "@/store/eventStore";
import { EventDashboard } from "@/components/admin/EventDashboard";

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
  id,
  isAdmin,
}: EventAdminTabsProps) => {
  console.log('EventAdminTabs - Event:', event);
  console.log('EventAdminTabs - isAdmin:', isAdmin);

  return (
    <Tabs defaultValue="dashboard" className="w-full" dir="rtl">
      <TabsList className="w-full justify-start border-b rounded-none">
        {isAdmin && <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>}
      </TabsList>
      
      {isAdmin && (
        <TabsContent value="dashboard" className="mt-0">
          <EventDashboard eventId={id} />
        </TabsContent>
      )}
    </Tabs>
  );
};
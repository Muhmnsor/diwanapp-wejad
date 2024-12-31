import { Event } from "@/store/eventStore";
import { EventContent } from "../EventContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDashboard } from "@/components/admin/EventDashboard";

interface EventDetailsContentProps {
  event: Event;
  isAdmin: boolean;
  id: string;
  onRegister: () => void;
}

export const EventDetailsContent = ({
  event,
  isAdmin,
  id,
  onRegister
}: EventDetailsContentProps) => {
  if (isAdmin) {
    return (
      <div className="bg-gray-50/50">
        <Tabs defaultValue="details" className="w-full">
          <div className="bg-white border-b">
            <div className="container mx-auto">
              <TabsList 
                className="w-full justify-start rounded-none bg-transparent h-auto" 
                dir="rtl"
              >
                <TabsTrigger 
                  value="details" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2"
                >
                  تفاصيل الفعالية
                </TabsTrigger>
                <TabsTrigger 
                  value="dashboard"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2"
                >
                  لوحة التحكم
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="container mx-auto px-4 pb-8" dir="rtl">
            <TabsContent value="details" className="mt-6">
              <EventContent 
                event={event}
                onRegister={onRegister}
              />
            </TabsContent>

            <TabsContent value="dashboard" className="mt-6">
              <EventDashboard eventId={id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  }

  return <EventContent event={event} onRegister={onRegister} />;
};
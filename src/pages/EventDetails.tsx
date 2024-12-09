import { Navigation } from "@/components/Navigation";
import { useParams } from "react-router-dom";
import { useEventStore, Event as CustomEvent } from "@/store/eventStore";
import { useState } from "react";
import { toast } from "sonner";
import { EditEventDialog } from "@/components/events/EditEventDialog";
import { EventDetailsView } from "@/components/events/EventDetailsView";
import { EventRegistrationDialog } from "@/components/events/EventRegistrationDialog";
import { arabicToEnglishNum, convertArabicDate } from "@/utils/eventUtils";
import { createCalendarUrl } from "@/utils/calendarUtils";

const EventDetails = () => {
  const { id } = useParams();
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const storeEvents = useEventStore((state) => state.events);
  const updateEvent = useEventStore((state) => state.updateEvent);

  const mockEvents = [
    {
      id: "1",
      title: "مؤتمر التكنولوجيا السنوي",
      description: "انضم إلينا في مؤتمر التكنولوجيا السنوي حيث نستكشف أحدث التقنيات والاتجاهات في عالم التكنولوجيا. سيتضمن المؤتمر متحدثين بارزين، وورش عمل تفاعلية، وفرص للتواصل مع خبراء الصناعة.",
      date: "١٥ مايو ٢٠٢٤",
      time: "٢:٠٠ مساءً",
      location: "فندق الريتز كارلتون، الرياض",
      imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
      attendees: 150,
      maxAttendees: 200,
      eventType: "in-person" as const,
      price: 500
    },
    {
      id: "2",
      title: "ورشة عمل تطوير التطبيقات",
      description: "ورشة عمل متخصصة في تطوير التطبيقات الحديثة باستخدام أحدث التقنيات والأدوات.",
      date: "٢٠ مايو ٢٠٢٤",
      time: "١٠:٠٠ صباحاً",
      location: "منصة زوم",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
      attendees: 50,
      maxAttendees: 100,
      eventType: "online" as const,
      price: "free" as const
    },
    {
      id: "3",
      title: "معرض الفنون التشكيلية",
      description: "معرض فني يجمع أعمال فنانين محليين وعالميين في مجال الفنون التشكيلية.",
      date: "٢٥ مايو ٢٠٢٤",
      time: "٤:٠٠ مساءً",
      location: "الدمام",
      imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
      attendees: 200,
      maxAttendees: 300,
      eventType: "in-person" as const,
      price: 100
    },
  ];

  const event = id?.startsWith('dynamic-')
    ? storeEvents[parseInt(id.replace('dynamic-', '')) - 1]
    : mockEvents.find(event => event.id === id);

  const handleAddToCalendar = () => {
    if (!event) return;

    try {
      const dateStr = arabicToEnglishNum(event.date);
      const timeStr = arabicToEnglishNum(event.time);
      
      console.log("Converting date:", dateStr, timeStr);
      const dateString = convertArabicDate(dateStr, timeStr);
      console.log("Parsed date string:", dateString);

      const eventDate = new Date(dateString);
      const endDate = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000));

      if (isNaN(eventDate.getTime())) {
        throw new Error('Invalid date conversion');
      }

      const calendarEvent = {
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: eventDate.toISOString().replace(/[-:]/g, '').split('.')[0],
        endDate: endDate.toISOString().replace(/[-:]/g, '').split('.')[0],
      };

      const calendarUrl = createCalendarUrl(calendarEvent);
      window.open(calendarUrl, '_blank');
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast.error("لم نتمكن من إضافة الفعالية إلى التقويم");
    }
  };

  const handleDeleteEvent = () => {
    toast.success("تم حذف الفعالية بنجاح");
  };

  const handleUpdateEvent = (updatedEvent: CustomEvent) => {
    console.log('Handling update event:', updatedEvent);
    
    if (id?.startsWith('dynamic-')) {
      const index = parseInt(id.replace('dynamic-', '')) - 1;
      console.log('Updating event at index:', index);
      
      updateEvent(index, updatedEvent);
      toast.success("تم تحديث الفعالية بنجاح");
      setIsEditDialogOpen(false);
      
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  if (!event) {
    return (
      <div dir="rtl" className="container mx-auto px-4 py-8">
        <Navigation />
        <div className="text-center">
          <h1 className="text-2xl font-bold">لم يتم العثور على الفعالية</h1>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <EventDetailsView
          event={event}
          onEdit={() => setIsEditDialogOpen(true)}
          onDelete={handleDeleteEvent}
          onAddToCalendar={handleAddToCalendar}
          onRegister={() => setIsRegistrationOpen(true)}
        />

        <EditEventDialog 
          event={event}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleUpdateEvent}
        />

        <EventRegistrationDialog
          open={isRegistrationOpen}
          onOpenChange={setIsRegistrationOpen}
          eventTitle={event.title}
          eventPrice={event.price}
        />
      </div>
    </div>
  );
};

export default EventDetails;

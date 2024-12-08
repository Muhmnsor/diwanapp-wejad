import { Navigation } from "@/components/Navigation";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEventStore } from "@/store/eventStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { EventInfo } from "@/components/events/EventInfo";
import { EventActions } from "@/components/events/EventActions";
import { RegistrationForm } from "@/components/events/RegistrationForm";
import { arabicToEnglishNum, convertArabicDate } from "@/utils/eventUtils";
import { createCalendarUrl } from "@/utils/calendarUtils";

const EventDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const storeEvents = useEventStore((state) => state.events);

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
    },
    {
      id: "2",
      title: "ورشة عمل تطوير التطبيقات",
      description: "ورشة عمل متخصصة في تطوير التطبيقات الحديثة باستخدام أحدث التقنيات والأدوات.",
      date: "٢٠ مايو ٢٠٢٤",
      time: "١٠:٠٠ صباحاً",
      location: "جدة",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
      attendees: 50,
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

      console.log("Event date:", eventDate);
      console.log("End date:", endDate);

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
      console.log("Calendar URL:", calendarUrl);

      window.open(calendarUrl, '_blank');
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إضافة الفعالية إلى التقويم",
        variant: "destructive",
      });
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
        <div className="max-w-4xl mx-auto">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-[400px] object-cover rounded-lg mb-8"
          />

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <EventActions
                eventTitle={event.title}
                eventDescription={event.description}
                onShare={async () => {}} // Empty function since sharing is now handled in ShareButton
                onAddToCalendar={handleAddToCalendar}
              />
            </div>

            <EventInfo
              date={event.date}
              time={event.time}
              location={event.location}
              attendees={event.attendees}
            />

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">عن الفعالية</h2>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            </div>

            <div className="flex justify-center">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full md:w-auto">
                    تسجيل الحضور
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-right">تسجيل الحضور في {event.title}</DialogTitle>
                  </DialogHeader>
                  <RegistrationForm
                    eventTitle={event.title}
                    onSubmit={() => setOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

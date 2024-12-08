import { Navigation } from "@/components/Navigation";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin, Share2, Users, CalendarPlus } from "lucide-react";
import { useEventStore } from "@/store/eventStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const EventDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  console.log("Event ID:", id);

  // Get all events from the store
  const storeEvents = useEventStore((state) => state.events);

  // Mock events data
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

  // Find the event from either mock events or store events
  const event = id?.startsWith('dynamic-')
    ? storeEvents[parseInt(id.replace('dynamic-', '')) - 1]
    : mockEvents.find(event => event.id === id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    toast({
      title: "تم التسجيل بنجاح",
      description: "سيتم التواصل معك قريباً",
    });
    setOpen(false);
    setFormData({ name: "", email: "", phone: "" });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "تم نسخ الرابط",
          description: "تم نسخ رابط الفعالية إلى الحافظة",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;

    // Convert Arabic date to English format (assuming date is in format "DD month YYYY")
    const dateStr = event.date.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    const timeStr = event.time.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    
    // Create calendar event URL
    const eventDate = new Date(`${dateStr} ${timeStr}`);
    const endDate = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours duration

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;

    window.open(calendarUrl, '_blank');
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
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleAddToCalendar}>
                  <CalendarPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3 text-gray-600">
                <CalendarDays className="h-5 w-5 text-primary" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="h-5 w-5 text-primary" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="h-5 w-5 text-primary" />
                <span>{event.attendees} مشارك</span>
              </div>
            </div>

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
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-right block">الاسم</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-right block">رقم الجوال</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">تأكيد التسجيل</Button>
                  </form>
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
import { EventCard } from "@/components/EventCard";
import { History, Rocket } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
interface EventsSectionProps {
  title: string;
  events: any[];
  registrations: {
    [key: string]: number;
  };
  isPastEvents?: boolean;
}
export const EventsSection = ({
  title,
  events,
  registrations,
  isPastEvents = false
}: EventsSectionProps) => {
  const {
    user
  } = useAuthStore();
  console.log('EventsSection - User:', user);
  console.log('EventsSection - Events:', events);

  // فلترة الفعاليات بناءً على الصلاحيات والنوع
  const visibleEvents = events.filter(event => {
    // تجاهل الأنشطة التي تنتمي إلى مشاريع
    if (event.is_project_activity) {
      return false;
    }

    // إذا كان المستخدم مشرف، اعرض جميع الفعاليات المستقلة
    if (user?.isAdmin) {
      return true;
    }
    // للمستخدمين العاديين، اعرض فقط الفعاليات المرئية
    return event.is_visible !== false;
  });
  console.log('EventsSection - Filtered Events:', visibleEvents);
  if (visibleEvents.length === 0) {
    return <section className="rounded-2xl bg-gradient-to-b from-[#F5F5F7] to-white dark:from-[#2A2F3C] dark:to-[#1A1F2C] p-8 shadow-sm">
        <div className={`border-r-4 ${isPastEvents ? 'border-[#9F9EA1]' : 'border-primary'} pr-4 mb-8 flex items-center gap-2`}>
          <h2 className="text-3xl font-bold text-[#403E43] dark:text-white">{title}</h2>
          {isPastEvents && <History className="w-6 h-6 text-[#9F9EA1]" />}
        </div>
        <div className="text-center text-[#9F9EA1] p-8 bg-[#F5F5F7] dark:bg-[#2A2F3C] rounded-2xl backdrop-blur-sm">
          <Rocket className="w-12 h-12 mx-auto mb-4 text-primary animate-bounce" />
          <p className="text-lg mb-2">
            {isPastEvents ? "لم تتم إضافة أي فعاليات سابقة بعد" : "لا توجد فعاليات حالية، ولكن هناك المزيد قادم!"}
          </p>
          <p className="text-sm opacity-75">
            {isPastEvents ? "تابعنا لمشاهدة أرشيف الفعاليات السابقة" : "ترقبوا فعالياتنا القادمة المميزة"}
          </p>
        </div>
      </section>;
  }
  return <section className="rounded-2xl bg-gradient-to-b from-[#F5F5F7] to-white dark:from-[#2A2F3C] dark:to-[#1A1F2C] p-8 shadow-sm px-[11px]">
      <div className={`border-r-4 ${isPastEvents ? 'border-[#9F9EA1]' : 'border-primary'} pr-4 mb-8 flex items-center gap-2`}>
        <h2 className="text-3xl font-bold text-[#403E43] dark:text-white">{title}</h2>
        {isPastEvents && <History className="w-6 h-6 text-[#9F9EA1]" />}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {visibleEvents.map(event => <div key={event.id} className="flex justify-center">
            <EventCard {...event} className={!event.is_visible ? "opacity-50" : ""} />
          </div>)}
      </div>
    </section>;
};
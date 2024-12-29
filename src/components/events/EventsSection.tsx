import { ActivityCard } from "@/components/shared/ActivityCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { History } from "lucide-react";

interface EventsSectionProps {
  title: string;
  events: any[];
  registrations: { [key: string]: number };
  isPastEvents?: boolean;
  isProjects?: boolean;
}

export const EventsSection = ({ 
  title, 
  events, 
  registrations, 
  isPastEvents = false,
  isProjects = false
}: EventsSectionProps) => {
  console.log('EventsSection rendering:', { 
    title, 
    eventsCount: events.length, 
    isProjects,
    firstEvent: events[0] 
  });

  if (events.length === 0) {
    return (
      <section className="rounded-2xl bg-gradient-to-b from-[#F5F5F7] to-white dark:from-[#2A2F3C] dark:to-[#1A1F2C] p-8 shadow-sm">
        <div className={`border-r-4 ${isPastEvents ? 'border-[#9F9EA1]' : 'border-primary'} pr-4 mb-8 flex items-center gap-2`}>
          <h2 className="text-3xl font-bold text-[#403E43] dark:text-white">{title}</h2>
          {isPastEvents && <History className="w-6 h-6 text-[#9F9EA1]" />}
        </div>
        <div className="text-center text-[#9F9EA1] p-8 bg-[#F5F5F7] dark:bg-[#2A2F3C] rounded-2xl backdrop-blur-sm">
          {isPastEvents ? 'لا توجد فعاليات سابقة' : isProjects ? 'لا توجد مشاريع حالياً' : 'لا توجد فعاليات قادمة حالياً'}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-gradient-to-b from-[#F5F5F7] to-white dark:from-[#2A2F3C] dark:to-[#1A1F2C] p-8 shadow-sm">
      <div className={`border-r-4 ${isPastEvents ? 'border-[#9F9EA1]' : 'border-primary'} pr-4 mb-8 flex items-center gap-2`}>
        <h2 className="text-3xl font-bold text-[#403E43] dark:text-white">{title}</h2>
        {isPastEvents && <History className="w-6 h-6 text-[#9F9EA1]" />}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {events.map((item) => (
          <div key={item.id} className={`flex justify-center ${isPastEvents ? 'opacity-75' : ''}`}>
            {isProjects ? (
              <ProjectCard 
                id={item.id}
                title={item.title}
                start_date={item.start_date}
                end_date={item.end_date}
                image_url={item.image_url}
                event_type={item.event_type}
                price={item.price}
                max_attendees={item.max_attendees}
                registration_start_date={item.registration_start_date}
                registration_end_date={item.registration_end_date}
                beneficiary_type={item.beneficiary_type}
                certificate_type={item.certificate_type}
              />
            ) : (
              <ActivityCard {...item} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
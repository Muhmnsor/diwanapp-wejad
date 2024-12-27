import { EventBadges } from "./badges/EventBadges";
import { EventDetails } from "./details/EventDetails";
import { BeneficiaryType } from "@/types/event";

interface EventInfoProps {
  date: string;
  time: string;
  location: string;
  location_url?: string;
  attendees: number | Array<any>;
  maxAttendees: number;
  eventType: "online" | "in-person";
  price: number | "free";
  beneficiaryType: BeneficiaryType;
  certificateType?: string;
  eventHours?: number;
  showBadges?: boolean;
  eventPath?: string;
  eventCategory?: string;
}

export const EventInfo = ({ 
  date, 
  time, 
  location, 
  location_url,
  attendees, 
  maxAttendees,
  eventType,
  price,
  beneficiaryType,
  certificateType,
  eventHours,
  showBadges = true,
  eventPath,
  eventCategory
}: EventInfoProps) => {
  console.log('EventInfo received props:', {
    certificateType,
    eventHours,
    eventType,
    price,
    beneficiaryType,
    location_url,
    eventPath,
    eventCategory
  });

  const formatEventPath = (path?: string) => {
    if (!path) return '';
    const pathMap: Record<string, string> = {
      'environment': 'البيئة',
      'community': 'المجتمع',
      'content': 'المحتوى'
    };
    return pathMap[path] || path;
  };

  const formatEventCategory = (category?: string) => {
    if (!category) return '';
    const categoryMap: Record<string, string> = {
      'social': 'اجتماعي',
      'entertainment': 'ترفيهي',
      'service': 'خدمي',
      'educational': 'تعليمي',
      'consulting': 'استشاري',
      'interest': 'اهتمام',
      'specialization': 'تخصص',
      'spiritual': 'روحي',
      'cultural': 'ثقافي',
      'behavioral': 'سلوكي',
      'skill': 'مهاري',
      'health': 'صحي',
      'diverse': 'متنوع'
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="space-y-8">
      {showBadges && (
        <EventBadges
          eventType={eventType}
          price={price}
          beneficiaryType={beneficiaryType}
          certificateType={certificateType}
          eventHours={eventHours}
        />
      )}
      
      <EventDetails
        date={date}
        time={time}
        location={location}
        location_url={location_url}
        eventType={eventType}
        attendees={attendees}
        maxAttendees={maxAttendees}
        eventPath={eventPath ? formatEventPath(eventPath) : undefined}
        eventCategory={eventCategory ? formatEventCategory(eventCategory) : undefined}
      />
      
      {eventPath && eventCategory && (
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <span>التصنيف:</span>
          <span className="font-semibold">{formatEventPath(eventPath)}</span>
          <span className="mx-1">\</span>
          <span className="font-semibold">{formatEventCategory(eventCategory)}</span>
        </div>
      )}
    </div>
  );
};
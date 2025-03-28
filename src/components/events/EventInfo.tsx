
import { EventBadges } from "./badges/EventBadges";
import { EventDetails } from "./details/EventDetails";
import { BeneficiaryType } from "@/types/event";
import { Tag, Folder } from "lucide-react";

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
      
      {/* Event Categories Section */}
      {(eventPath || eventCategory) && (
        <div className="px-8 flex items-center gap-6">
          {eventPath && (
            <div className="flex items-center gap-2 text-gray-600">
              <Folder className="w-5 h-5" />
              <span>المسار: {formatEventPath(eventPath)}</span>
            </div>
          )}
          {eventCategory && (
            <div className="flex items-center gap-2 text-gray-600">
              <Tag className="w-5 h-5" />
              <span>التصنيف: {formatEventCategory(eventCategory)}</span>
            </div>
          )}
        </div>
      )}
      
      <EventDetails
        date={date}
        time={time}
        location={location}
        location_url={location_url}
        eventType={eventType}
        attendees={attendees}
        maxAttendees={maxAttendees}
        eventPath={eventPath}
        eventCategory={eventCategory}
      />
    </div>
  );
};

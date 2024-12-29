import { ProjectBadges } from "./badges/ProjectBadges";
import { BeneficiaryType } from "@/types/event";
import { Tag, Folder, Calendar, Users } from "lucide-react";
import { useDashboardData } from "@/components/admin/dashboard/useDashboardData";

interface ProjectInfoProps {
  startDate: string;
  endDate: string;
  attendees: number;
  maxAttendees: number;
  eventType: "online" | "in-person";
  price: number | null;
  beneficiaryType: BeneficiaryType;
  certificateType?: string;
  showBadges?: boolean;
  eventPath?: string;
  eventCategory?: string;
}

export const ProjectInfo = ({ 
  startDate, 
  endDate,
  attendees, 
  maxAttendees,
  eventType,
  price,
  beneficiaryType,
  certificateType,
  showBadges = true,
  eventPath,
  eventCategory
}: ProjectInfoProps) => {
  console.log('ProjectInfo received props:', {
    certificateType,
    eventType,
    price,
    beneficiaryType,
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
        <ProjectBadges
          eventType={eventType}
          price={price}
          beneficiaryType={beneficiaryType}
          certificateType={certificateType}
        />
      )}
      
      {/* Project Categories Section */}
      {(eventPath || eventCategory) && (
        <div className="px-8 flex items-center gap-6">
          {eventPath && (
            <div className="flex items-center gap-2 text-gray-600">
              <Folder className="w-5 h-5 text-primary" />
              <span>المسار: {formatEventPath(eventPath)}</span>
            </div>
          )}
          {eventCategory && (
            <div className="flex items-center gap-2 text-gray-600">
              <Tag className="w-5 h-5 text-primary" />
              <span>التصنيف: {formatEventCategory(eventCategory)}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Project Dates and Attendees */}
      <div className="px-8 space-y-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-5 h-5 text-primary" />
          <span>تاريخ البداية: {startDate}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-5 h-5 text-primary" />
          <span>تاريخ النهاية: {endDate}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-5 h-5 text-primary" />
          <span dir="rtl">{attendees} من {maxAttendees} مشارك</span>
        </div>
      </div>
    </div>
  );
};
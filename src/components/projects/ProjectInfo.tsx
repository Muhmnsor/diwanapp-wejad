import { ProjectBadges } from "./badges/ProjectBadges";
import { BeneficiaryType } from "@/types/event";
import { Tag, Folder, Calendar, Users } from "lucide-react";
import { useDashboardData } from "@/components/admin/dashboard/useDashboardData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectInfoProps {
  startDate: string;
  endDate: string;
  maxAttendees: number;
  eventType: "online" | "in-person";
  price: number | null;
  beneficiaryType: BeneficiaryType;
  certificateType?: string;
  showBadges?: boolean;
  eventPath?: string;
  eventCategory?: string;
  projectId?: string;
}

export const ProjectInfo = ({ 
  startDate, 
  endDate,
  maxAttendees,
  eventType,
  price,
  beneficiaryType,
  certificateType,
  showBadges = true,
  eventPath,
  eventCategory,
  projectId
}: ProjectInfoProps) => {
  console.log('ProjectInfo received props:', {
    certificateType,
    eventType,
    price,
    beneficiaryType,
    eventPath,
    eventCategory,
    projectId
  });

  // Fetch actual registration count
  const { data: registrations = [] } = useQuery({
    queryKey: ['project-registrations', projectId],
    queryFn: async () => {
      if (!projectId) {
        console.error('No projectId provided to ProjectInfo');
        return [];
      }
      
      console.log('Fetching registrations for project:', projectId);
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching registrations:', error);
        throw error;
      }

      console.log('Fetched registrations:', data);
      return data || [];
    },
    enabled: Boolean(projectId) // Only run query if projectId exists and is not undefined
  });

  const actualAttendees = registrations?.length || 0;
  console.log('Actual attendees count:', actualAttendees);

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
              <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
                <Folder className="w-5 h-5 text-primary" />
              </div>
              <span>المسار: {formatEventPath(eventPath)}</span>
            </div>
          )}
          {eventCategory && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <span>التصنيف: {formatEventCategory(eventCategory)}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Project Dates and Attendees */}
      <div className="px-8 space-y-4">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <span>تاريخ البداية: {startDate}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <span>تاريخ النهاية: {endDate}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <span dir="rtl">{actualAttendees} من {maxAttendees} مشارك</span>
        </div>
      </div>
    </div>
  );
};
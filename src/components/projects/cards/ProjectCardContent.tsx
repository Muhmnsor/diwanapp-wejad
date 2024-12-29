import { CalendarDays, Users, ListChecks } from "lucide-react";
import { BeneficiaryCardBadge } from "@/components/events/badges/card/BeneficiaryCardBadge";
import { CertificateCardBadge } from "@/components/events/badges/card/CertificateCardBadge";
import { EventTypeCardBadge } from "@/components/events/badges/card/EventTypeCardBadge";
import { PriceCardBadge } from "@/components/events/badges/card/PriceCardBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectCardContentProps {
  startDate: string;
  endDate: string;
  eventType: "online" | "in-person";
  price: number | null;
  beneficiaryType: string;
  certificateType?: string;
  maxAttendees?: number;
  eventPath?: string;
  eventCategory?: string;
  projectId: string;
}

export const ProjectCardContent = ({
  startDate,
  endDate,
  eventType,
  price,
  beneficiaryType,
  certificateType,
  maxAttendees = 0,
  eventPath,
  eventCategory,
  projectId
}: ProjectCardContentProps) => {
  // Query to get activities count
  const { data: activitiesCount = 0 } = useQuery({
    queryKey: ['project-activities-count', projectId],
    queryFn: async () => {
      console.log("Fetching activities count for project:", projectId);
      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (error) {
        console.error("Error fetching activities count:", error);
        throw error;
      }
      
      console.log("Activities count:", count);
      return count || 0;
    },
  });

  return (
    <div className="space-y-3 p-4 pt-0">
      <div className="flex flex-wrap gap-2">
        <EventTypeCardBadge eventType={eventType} />
        <PriceCardBadge price={price} />
        <BeneficiaryCardBadge beneficiaryType={beneficiaryType} />
        {certificateType && certificateType !== 'none' && (
          <CertificateCardBadge certificateType={certificateType} />
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4" />
          <span>عدد الأنشطة: {activitiesCount}</span>
        </div>
        {maxAttendees > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{maxAttendees} مقعد</span>
          </div>
        )}
      </div>
    </div>
  );
};
import { ProjectBadges } from "./badges/ProjectBadges";
import { BeneficiaryType } from "@/types/event";
import { ProjectCategories } from "./info/ProjectCategories";
import { ProjectDates } from "./info/ProjectDates";
import { ProjectAttendees } from "./info/ProjectAttendees";

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
    projectId,
    maxAttendees
  });

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
      
      <ProjectCategories 
        eventPath={eventPath}
        eventCategory={eventCategory}
      />
      
      <div className="px-8 space-y-4">
        <ProjectDates 
          startDate={startDate}
          endDate={endDate}
        />
        <ProjectAttendees 
          projectId={projectId}
          maxAttendees={maxAttendees}
        />
      </div>
    </div>
  );
};
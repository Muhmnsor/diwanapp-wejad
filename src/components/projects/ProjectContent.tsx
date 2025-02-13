import { Project } from "@/types/project";
import { ProjectInfo } from "./ProjectInfo";
import { ProjectDescription } from "./ProjectDescription";
import { ProjectBadges } from "./badges/ProjectBadges";
import { EventRegisterButton } from "../events/EventRegisterButton";
import { ProjectRegistrationDialog } from "./registration/ProjectRegistrationDialog";
import { useState } from "react";
import { getEventStatus } from "@/utils/eventUtils";
import { EventPathType, EventCategoryType } from "@/types/event";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
interface ProjectContentProps {
  project: Project;
}
export const ProjectContent = ({
  project
}: ProjectContentProps) => {
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);

  // Fetch current registrations count
  const {
    data: registrations = []
  } = useQuery({
    queryKey: ['project-registrations', project.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('registrations').select('*').eq('project_id', project.id);
      if (error) throw error;
      return data || [];
    }
  });

  // Convert project dates to event format for status check
  const eventFormatData = {
    id: project.id,
    title: project.title,
    description: project.description,
    date: project.start_date,
    time: "00:00",
    location: "",
    event_type: project.event_type,
    price: project.price || 0,
    max_attendees: project.max_attendees,
    registrationStartDate: project.registration_start_date,
    registrationEndDate: project.registration_end_date,
    beneficiaryType: project.beneficiary_type,
    certificate_type: project.certificate_type || "none",
    event_hours: 0,
    attendees: registrations.length,
    imageUrl: project.image_url,
    event_path: project.event_path as EventPathType,
    event_category: project.event_category as EventCategoryType
  };
  const status = getEventStatus(eventFormatData);
  console.log('Project registration status:', status);
  return <div className="bg-white rounded-lg divide-y divide-gray-100" dir="rtl">
      <div className="py-8 px-[32px]">
        <ProjectBadges eventType={project.event_type} price={project.price} beneficiaryType={project.beneficiary_type} certificateType={project.certificate_type} />
      </div>

      <div className="py-8 px-8">
        <ProjectInfo startDate={project.start_date} endDate={project.end_date} maxAttendees={project.max_attendees} eventType={project.event_type} price={project.price} beneficiaryType={project.beneficiary_type} certificateType={project.certificate_type} eventPath={project.event_path} eventCategory={project.event_category} showBadges={false} projectId={project.id} />
      </div>

      <div className="py-8">
        <ProjectDescription description={project.description} />
      </div>

      <div className="px-8 py-6">
        <EventRegisterButton status={status} onRegister={() => setShowRegistrationDialog(true)} />
      </div>

      <ProjectRegistrationDialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog} project={project} />
    </div>;
};
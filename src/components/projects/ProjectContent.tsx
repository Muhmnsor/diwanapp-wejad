import { Project } from "@/types/project";
import { ProjectInfo } from "./ProjectInfo";
import { ProjectDescription } from "./ProjectDescription";
import { ProjectBadges } from "./badges/ProjectBadges";
import { EventRegisterButton } from "../events/EventRegisterButton";
import { EventRegistrationDialog } from "../events/EventRegistrationDialog";
import { useState } from "react";
import { getEventStatus } from "@/utils/eventUtils";

interface ProjectContentProps {
  project: Project;
}

export const ProjectContent = ({ project }: ProjectContentProps) => {
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);

  // Convert project dates to event format for status check
  const eventFormatData = {
    title: project.title,
    description: project.description,
    date: project.start_date,
    time: "00:00",
    location: "",
    event_type: project.event_type,
    image_url: project.image_url,
    price: project.price,
    max_attendees: project.max_attendees,
    registrationStartDate: project.registration_start_date,
    registrationEndDate: project.registration_end_date,
    beneficiaryType: project.beneficiary_type,
    certificateType: project.certificate_type,
    event_hours: 0,
    attendees: 0, // You might want to fetch this from the database
    event_path: project.event_path,
    event_category: project.event_category
  };

  const status = getEventStatus(eventFormatData);
  console.log('Project registration status:', status);

  return (
    <div className="bg-white rounded-b-2xl shadow-sm">
      <div className="px-8 py-6">
        <ProjectBadges
          eventType={project.event_type}
          price={project.price}
          beneficiaryType={project.beneficiary_type}
          certificateType={project.certificate_type}
        />

        <ProjectInfo
          startDate={project.start_date}
          endDate={project.end_date}
          attendees={0}
          maxAttendees={project.max_attendees}
          eventType={project.event_type}
          price={project.price}
          beneficiaryType={project.beneficiary_type}
          certificateType={project.certificate_type}
          eventPath={project.event_path}
          eventCategory={project.event_category}
          showBadges={false}
        />

        <ProjectDescription description={project.description} />

        <div className="mt-8">
          <EventRegisterButton 
            status={status}
            onRegister={() => setShowRegistrationDialog(true)}
          />
        </div>
      </div>

      <EventRegistrationDialog
        open={showRegistrationDialog}
        onOpenChange={setShowRegistrationDialog}
        event={{
          ...eventFormatData,
          id: project.id,
          location_url: null
        }}
      />
    </div>
  );
};
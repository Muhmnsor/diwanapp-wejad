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
    date: project.start_date,
    time: "00:00",
    registrationStartDate: project.registration_start_date,
    registrationEndDate: project.registration_end_date,
    max_attendees: project.max_attendees,
    attendees: 0, // You might want to fetch this from the database
  };

  const status = getEventStatus(eventFormatData);
  console.log('Project registration status:', status);

  return (
    <div className="bg-white rounded-lg divide-y divide-gray-100" dir="rtl">
      <div className="py-8">
        <ProjectBadges
          eventType={project.event_type}
          price={project.price}
          beneficiaryType={project.beneficiary_type}
          certificateType={project.certificate_type}
        />
      </div>

      <div className="py-8 px-8">
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
      </div>

      <div className="py-8">
        <ProjectDescription description={project.description} />
      </div>

      <div className="p-8">
        <EventRegisterButton
          status={status}
          onRegister={() => setShowRegistrationDialog(true)}
        />
      </div>

      <EventRegistrationDialog
        open={showRegistrationDialog}
        onOpenChange={setShowRegistrationDialog}
        event={{
          ...project,
          title: project.title,
          date: project.start_date,
          time: "00:00",
          location: "",
          price: project.price || "free",
          certificate_type: project.certificate_type || "none"
        }}
      />
    </div>
  );
};
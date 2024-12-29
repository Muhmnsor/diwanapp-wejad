import { Project } from "@/types/project";
import { ProjectInfo } from "./ProjectInfo";
import { ProjectDescription } from "./ProjectDescription";
import { ProjectBadges } from "./badges/ProjectBadges";

interface ProjectContentProps {
  project: Project;
}

export const ProjectContent = ({ project }: ProjectContentProps) => {
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
    </div>
  );
};
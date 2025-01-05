import { CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { ProjectCardContent } from "./cards/ProjectCardContent";
import { ProjectCardStatus } from "./cards/ProjectCardStatus";
import { ProjectCardHeader } from "./cards/ProjectCardHeader";
import { ProjectCardFooter } from "./cards/ProjectCardFooter";
import { ProjectCardWrapper } from "./cards/ProjectCardWrapper";
import { ProjectCardImageSection } from "./cards/ProjectCardImageSection";
import { ProjectCardRegistrationInfo } from "./cards/ProjectCardRegistrationInfo";

interface ProjectCardProps {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  location?: string;
  image_url: string;
  event_type: "online" | "in-person";
  price: number | null;
  max_attendees?: number;
  registration_start_date?: string | null;
  registration_end_date?: string | null;
  beneficiary_type: string;
  certificate_type?: string;
  event_path?: string;
  event_category?: string;
  is_visible?: boolean;
  className?: string;
}

export const ProjectCard = ({ 
  id, 
  title, 
  start_date,
  end_date,
  image_url, 
  event_type, 
  price,
  max_attendees = 0,
  registration_start_date,
  registration_end_date,
  beneficiary_type,
  certificate_type = 'none',
  event_path,
  event_category,
  is_visible = true,
  className = ""
}: ProjectCardProps) => {
  const { registrationStatus } = ProjectCardRegistrationInfo({
    id,
    startDate: start_date,
    endDate: end_date,
    registrationStartDate: registration_start_date,
    registrationEndDate: registration_end_date,
    maxAttendees: max_attendees,
  });

  useEffect(() => {
    console.log('ProjectCard data:', {
      title,
      dates: {
        start: start_date,
        end: end_date
      },
      certificate: {
        type: certificate_type
      },
      max_attendees,
      registrationDates: {
        start: registration_start_date,
        end: registration_end_date
      },
      beneficiaryType: beneficiary_type,
      eventPath: event_path,
      eventCategory: event_category,
      isVisible: is_visible,
      registrationStatus: registrationStatus.status
    });
  }, [title, start_date, end_date, certificate_type, max_attendees, registration_start_date, 
      registration_end_date, beneficiary_type, event_path, event_category, is_visible, 
      registrationStatus]);

  return (
    <ProjectCardWrapper className={className}>
      <ProjectCardImageSection
        imageUrl={image_url}
        title={title}
        isVisible={is_visible}
      />
      
      <ProjectCardHeader title={title} />
      
      <CardContent>
        <ProjectCardContent
          startDate={start_date}
          endDate={end_date}
          eventType={event_type}
          price={price}
          beneficiaryType={beneficiary_type}
          certificateType={certificate_type}
          maxAttendees={max_attendees}
          eventPath={event_path}
          eventCategory={event_category}
        />
        <ProjectCardStatus status={registrationStatus} />
      </CardContent>

      <ProjectCardFooter projectId={id} />
    </ProjectCardWrapper>
  );
};
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { ProjectCardContent } from "./cards/ProjectCardContent";
import { ProjectCardImage } from "./cards/ProjectCardImage";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useAuthStore } from "@/store/authStore";
import { ProjectCardStatus } from "./cards/ProjectCardStatus";
import { ProjectCardVisibility } from "./cards/ProjectCardVisibility";
import { ProjectCardHeader } from "./cards/ProjectCardHeader";
import { ProjectCardFooter } from "./cards/ProjectCardFooter";
import { getRegistrationStatus } from "./utils/registrationStatus";

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
  const { isAuthenticated } = useAuthStore();
  const { data: registrations = {} } = useRegistrations();
  
  const isRegistered = isAuthenticated && registrations[id];
  const currentRegistrations = Object.values(registrations).filter(reg => 
    typeof reg === 'object' && 'project_id' in reg && reg.project_id === id
  ).length;
  
  const registrationStatus = getRegistrationStatus(
    start_date,
    end_date,
    registration_start_date,
    registration_end_date,
    max_attendees,
    currentRegistrations,
    Boolean(isRegistered)
  );

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
      isRegistered,
      registrationStatus: registrationStatus.status
    });
  }, [title, start_date, end_date, certificate_type, max_attendees, registration_start_date, 
      registration_end_date, beneficiary_type, event_path, event_category, is_visible, 
      isRegistered, registrationStatus]);

  return (
    <div className={`w-[380px] sm:w-[460px] lg:w-[480px] mx-auto relative ${className}`} dir="rtl">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in h-full">
        <div className="relative">
          <ProjectCardImage src={image_url} alt={title} />
          <ProjectCardVisibility isVisible={is_visible} />
        </div>
        
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
      </Card>
    </div>
  );
};
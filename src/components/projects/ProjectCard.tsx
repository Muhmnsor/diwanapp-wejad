import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { EyeOff, UserCheck, UserX, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { ProjectCardContent } from "./cards/ProjectCardContent";
import { ProjectCardImage } from "./cards/ProjectCardImage";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useAuthStore } from "@/store/authStore";

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

const getRegistrationStatus = (
  startDate: string,
  endDate: string,
  registrationStartDate: string | null | undefined,
  registrationEndDate: string | null | undefined,
  maxAttendees: number = 0,
  currentRegistrations: number = 0,
  isRegistered: boolean = false
) => {
  const now = new Date();
  const projectEndDate = new Date(endDate);
  const projectStartDate = new Date(startDate);
  
  const regStartDate = registrationStartDate ? new Date(registrationStartDate) : null;
  const regEndDate = registrationEndDate ? new Date(registrationEndDate) : null;

  if (now > projectEndDate) {
    return {
      status: 'ended',
      label: 'انتهى المشروع',
      icon: XCircle,
      color: 'bg-gray-500'
    };
  }

  if (isRegistered) {
    return {
      status: 'registered',
      label: 'مسجل',
      icon: CheckCircle,
      color: 'bg-green-500'
    };
  }

  if (maxAttendees > 0 && currentRegistrations >= maxAttendees) {
    return {
      status: 'full',
      label: 'اكتمل العدد',
      icon: AlertCircle,
      color: 'bg-yellow-500'
    };
  }

  if (regStartDate && now < regStartDate) {
    return {
      status: 'notStarted',
      label: 'لم يبدأ التسجيل',
      icon: Clock,
      color: 'bg-blue-500'
    };
  }

  if (regEndDate && now > regEndDate) {
    return {
      status: 'registrationEnded',
      label: 'انتهى التسجيل',
      icon: XCircle,
      color: 'bg-red-500'
    };
  }

  if (now >= projectStartDate) {
    return {
      status: 'started',
      label: 'بدأ المشروع',
      icon: AlertCircle,
      color: 'bg-orange-500'
    };
  }

  return {
    status: 'available',
    label: 'التسجيل متاح',
    icon: CheckCircle,
    color: 'bg-green-500'
  };
};

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
  const currentRegistrations = Object.values(registrations).filter(reg => reg.project_id === id).length;
  
  const registrationStatus = getRegistrationStatus(
    start_date,
    end_date,
    registration_start_date,
    registration_end_date,
    max_attendees,
    currentRegistrations,
    isRegistered
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
  }, [title, start_date, end_date, certificate_type, max_attendees, registration_start_date, registration_end_date, beneficiary_type, event_path, event_category, is_visible, isRegistered, registrationStatus]);

  return (
    <div className={`w-[380px] sm:w-[460px] lg:w-[480px] mx-auto relative ${className}`} dir="rtl">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in h-full">
        <div className="relative">
          <ProjectCardImage src={image_url} alt={title} />
          {!is_visible && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
              <EyeOff className="w-4 h-4" />
              مخفي
            </div>
          )}
        </div>
        <CardHeader className="p-4">
          <CardTitle className="text-lg line-clamp-2 text-right">{title}</CardTitle>
        </CardHeader>
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
          <div className={`${registrationStatus.color} text-white px-2 py-1 rounded-md text-sm flex items-center gap-1 mt-2`}>
            <registrationStatus.icon className="w-4 h-4" />
            {registrationStatus.label}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button asChild className="w-full" size="sm">
            <Link to={`/projects/${id}`}>عرض التفاصيل</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

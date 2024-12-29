import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getEventStatus } from "@/utils/eventUtils";
import { EventCardContent } from "../events/cards/EventCardContent";
import { getRegistrationStatusConfig } from "@/utils/eventStatusUtils";
import { useRegistrations } from "@/hooks/useRegistrations";

interface ActivityCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  image_url: string;
  event_type: "online" | "in-person";
  price: number | null;
  max_attendees?: number;
  registration_start_date?: string | null;
  registration_end_date?: string | null;
  beneficiary_type: string;
  certificate_type?: string;
  event_hours?: number;
  isProject?: boolean;
}

export const ActivityCard = ({ 
  id, 
  title, 
  date, 
  location, 
  image_url, 
  event_type, 
  price,
  max_attendees = 0,
  registration_start_date,
  registration_end_date,
  beneficiary_type,
  certificate_type = 'none',
  event_hours = 0,
  isProject = false
}: ActivityCardProps) => {
  const { data: registrationCounts } = useRegistrations();
  const currentAttendees = registrationCounts?.[id] || 0;
  
  const status = getEventStatus({
    date,
    time: "00:00",
    max_attendees,
    registrationStartDate: registration_start_date,
    registrationEndDate: registration_end_date,
    beneficiaryType: beneficiary_type,
    attendees: currentAttendees
  } as any);

  const statusConfig = getRegistrationStatusConfig(status);

  return (
    <div className="w-[380px] sm:w-[460px] lg:w-[480px] mx-auto" dir="rtl">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in h-full">
        <img src={image_url} alt={title} className="w-full h-40 object-cover" />
        <CardHeader className="p-4">
          <CardTitle className="text-lg line-clamp-2 text-right">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EventCardContent
            date={date}
            location={location}
            eventType={event_type}
            price={price}
            beneficiaryType={beneficiary_type}
            certificateType={certificate_type}
            eventHours={event_hours}
            maxAttendees={max_attendees}
            status={statusConfig}
          />
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button asChild className="w-full" size="sm">
            <Link to={`/${isProject ? 'projects' : 'events'}/${id}`}>عرض التفاصيل</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
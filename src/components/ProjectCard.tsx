import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { EventCardBadges } from "./events/cards/EventCardBadges";
import { EventCardStatus } from "./events/cards/EventCardStatus";
import { EventCardDetails } from "./events/cards/EventCardDetails";
import { getEventStatus } from "@/utils/eventUtils";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  image_url: string;
  event_type: "online" | "in-person";
  price: number | "free";
  beneficiary_type: string;
  certificate_type?: string;
  event_hours?: number;
  max_attendees: number;
  attendees: number;
  registration_start_date?: string;
  registration_end_date?: string;
}

export const ProjectCard = ({
  id,
  title,
  description,
  start_date,
  end_date,
  image_url,
  event_type,
  price,
  beneficiary_type,
  certificate_type,
  event_hours,
  max_attendees,
  attendees,
  registration_start_date,
  registration_end_date,
}: ProjectCardProps) => {
  // Transform project dates to match event format for status checking
  const projectAsEvent = {
    date: end_date,
    time: "00:00",
    registrationStartDate: registration_start_date,
    registrationEndDate: registration_end_date,
    max_attendees,
    attendees,
  };

  const status = getEventStatus(projectAsEvent);

  return (
    <Link to={`/projects/${id}`}>
      <Card className="w-full max-w-sm mx-auto overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="relative">
          <img
            src={image_url || "/placeholder.svg"}
            alt={title}
            className="w-full h-48 object-cover"
          />
          <EventCardStatus status={status} className="absolute top-4 left-4" />
        </div>

        <CardContent className="p-4">
          <h3 className="text-xl font-semibold mb-2 text-right">{title}</h3>
          <p className="text-gray-600 mb-4 text-right line-clamp-2">{description}</p>

          <EventCardBadges
            eventType={event_type}
            price={price}
            beneficiaryType={beneficiary_type}
            certificateType={certificate_type}
            eventHours={event_hours}
          />
        </CardContent>

        <CardFooter className="bg-gray-50 p-4">
          <EventCardDetails
            date={start_date}
            endDate={end_date}
            attendees={attendees}
            maxAttendees={max_attendees}
          />
        </CardFooter>
      </Card>
    </Link>
  );
};
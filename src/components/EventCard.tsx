import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getEventStatus } from "@/utils/eventUtils";
import { useEffect } from "react";
import { EventCardBadges } from "./events/cards/EventCardBadges";
import { EventCardDetails } from "./events/cards/EventCardDetails";
import { EventCardStatus } from "./events/cards/EventCardStatus";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  image_url: string;
  event_type: "online" | "in-person";
  price: number | null;
  attendees?: number;
  max_attendees?: number;
  registration_start_date?: string | null;
  registration_end_date?: string | null;
  beneficiary_type: string;
  certificate_type?: string;
  event_hours?: number;
}

export const EventCard = ({ 
  id, 
  title, 
  date, 
  location, 
  image_url, 
  event_type, 
  price,
  attendees = 0,
  max_attendees = 0,
  registration_start_date,
  registration_end_date,
  beneficiary_type,
  certificate_type = 'none',
  event_hours = 0
}: EventCardProps) => {
  const remainingSeats = max_attendees - attendees;
  const isAlmostFull = remainingSeats <= max_attendees * 0.2;

  useEffect(() => {
    console.log('EventCard data:', {
      title,
      certificate: {
        type: certificate_type,
        hours: event_hours
      }
    });
  }, [title, certificate_type, event_hours]);

  const getRegistrationStatus = () => {
    const status = getEventStatus({
      date,
      time: "00:00",
      attendees,
      maxAttendees: max_attendees,
      registrationStartDate: registration_start_date,
      registrationEndDate: registration_end_date,
      beneficiaryType: beneficiary_type
    } as any);

    switch (status) {
      case 'eventStarted':
        return { text: "انتهت الفعالية", variant: "destructive" as const, color: "bg-gray-500" };
      case 'full':
        return { text: "اكتمل التسجيل", variant: "destructive" as const, color: "bg-purple-500" };
      case 'notStarted':
        return { text: "لم يبدأ التسجيل", variant: "secondary" as const, color: "bg-gray-500" };
      case 'ended':
        return { text: "انتهى التسجيل", variant: "destructive" as const, color: "bg-red-500" };
      default:
        return isAlmostFull 
          ? { text: "التسجيل متاح - الأماكن محدودة", variant: "accent" as const, color: "bg-yellow-500" }
          : { text: "التسجيل متاح", variant: "secondary" as const, color: "bg-green-500" };
    }
  };

  const status = getRegistrationStatus();

  return (
    <div className="w-[380px] mx-auto">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in h-full">
        <img src={image_url} alt={title} className="w-full h-40 object-cover" />
        <CardHeader className="p-4">
          <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          <EventCardBadges
            eventType={event_type}
            price={price}
            beneficiaryType={beneficiary_type}
            certificateType={certificate_type}
            eventHours={event_hours}
          />
          <EventCardDetails
            date={date}
            location={location}
          />
          {max_attendees > 0 && (
            <EventCardStatus
              remainingSeats={remainingSeats}
              maxAttendees={max_attendees}
              status={status}
            />
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button asChild className="w-full" size="sm">
            <Link to={`/event/${id}`}>عرض التفاصيل</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
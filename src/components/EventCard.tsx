import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

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
  beneficiary_type
}: EventCardProps) => {
  const remainingSeats = max_attendees - attendees;
  const isAlmostFull = remainingSeats <= max_attendees * 0.2;
  const isFull = remainingSeats <= 0;

  const getRegistrationStatus = () => {
    const now = new Date();
    const startDate = registration_start_date ? new Date(registration_start_date) : null;
    const endDate = registration_end_date ? new Date(registration_end_date) : null;

    if (isFull) {
      return { text: "اكتمل التسجيل", variant: "destructive" as const, color: "bg-purple-500" };
    }

    if (startDate && now < startDate) {
      return { text: "لم يبدأ التسجيل", variant: "secondary" as const, color: "bg-gray-500" };
    }

    if (endDate && now > endDate) {
      return { text: "انتهى التسجيل", variant: "destructive" as const, color: "bg-red-500" };
    }

    if (isAlmostFull) {
      return { text: "التسجيل متاح - الأماكن محدودة", variant: "accent" as const, color: "bg-yellow-500" };
    }

    return { text: "التسجيل متاح", variant: "secondary" as const, color: "bg-green-500" };
  };

  const getBeneficiaryLabel = (type: string) => {
    switch (type) {
      case 'men':
        return 'رجال';
      case 'women':
        return 'نساء';
      default:
        return 'رجال ونساء';
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
          <div className="flex flex-wrap gap-2">
            <Badge variant={event_type === "online" ? "secondary" : "default"}>
              {event_type === "online" ? "عن بعد" : "حضوري"}
            </Badge>
            <Badge variant={!price ? "secondary" : "default"}>
              {!price ? "مجاني" : `${price} ريال`}
            </Badge>
            <Badge variant="outline" className="text-primary">
              {getBeneficiaryLabel(beneficiary_type)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <CalendarDays size={16} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <MapPin size={16} />
            <span>{location}</span>
          </div>
          {max_attendees > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Users size={16} />
                <span>{attendees} من {max_attendees} مشارك</span>
              </div>
              <div className={`text-center py-1 px-2 rounded-md text-white ${status.color}`}>
                {status.text}
              </div>
            </div>
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
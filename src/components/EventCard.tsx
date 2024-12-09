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
  max_attendees = 0
}: EventCardProps) => {
  const remainingSeats = max_attendees - attendees;
  const isAlmostFull = remainingSeats <= max_attendees * 0.2; // Less than 20% seats remaining

  return (
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
          <div className={`flex items-center gap-2 ${isAlmostFull ? 'text-red-600' : 'text-green-600'} font-medium`}>
            <Users size={16} />
            <span>
              {remainingSeats > 0 
                ? `${remainingSeats} مقعد متبقي`
                : 'اكتمل العدد'}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" size="sm">
          <Link to={`/event/${id}`}>عرض التفاصيل</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface EventCardFooterProps {
  eventId: string;
}

export const EventCardFooter = ({ eventId }: EventCardFooterProps) => {
  return (
    <CardFooter className="p-4 pt-0">
      <Button asChild className="w-full" size="sm">
        <Link to={`/events/${eventId}`}>عرض التفاصيل</Link>
      </Button>
    </CardFooter>
  );
};
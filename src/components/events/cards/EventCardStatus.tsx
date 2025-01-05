import { Badge } from "@/components/ui/badge";
import { XCircle, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface EventCardStatusProps {
  maxAttendees: number;
  status: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "accent";
    color: string;
    textColor: string;
  };
}

export const EventCardStatus = ({
  status
}: EventCardStatusProps) => {
  const getStatusIcon = () => {
    switch (status.text) {
      case "انتهت الفعالية":
        return <XCircle className="w-4 h-4" />;
      case "اكتمل التسجيل":
        return <AlertCircle className="w-4 h-4" />;
      case "لم يبدأ التسجيل":
        return <Clock className="w-4 h-4" />;
      case "انتهى التسجيل":
        return <XCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`${status.color} text-white px-2 py-1 rounded-md text-sm flex items-center justify-center gap-2 mt-2`}>
      {getStatusIcon()}
      {status.text}
    </div>
  );
};
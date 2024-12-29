import { BeneficiaryType } from "@/types/event";
import { Badge } from "@/components/ui/badge";
import { Users2, Medal, Clock, Coins, Globe } from "lucide-react";

interface ProjectBadgesProps {
  eventType: "online" | "in-person";
  price: number | "free";
  beneficiaryType: BeneficiaryType;
  certificateType?: string;
  eventHours?: number;
}

export const ProjectBadges = ({
  eventType,
  price,
  beneficiaryType,
  certificateType,
  eventHours,
}: ProjectBadgesProps) => {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <Badge variant="outline" className="flex items-center gap-1">
        <Globe className="w-3 h-3" />
        {eventType === "online" ? "عن بعد" : "حضوري"}
      </Badge>

      <Badge variant="outline" className="flex items-center gap-1">
        <Coins className="w-3 h-3" />
        {price === "free" || price === 0 ? "مجاني" : `${price} ريال`}
      </Badge>

      <Badge variant="outline" className="flex items-center gap-1">
        <Users2 className="w-3 h-3" />
        {beneficiaryType === "male"
          ? "رجال"
          : beneficiaryType === "female"
          ? "نساء"
          : "رجال ونساء"}
      </Badge>

      {certificateType && certificateType !== "none" && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Medal className="w-3 h-3" />
          {certificateType === "attendance"
            ? "شهادة حضور"
            : certificateType === "certified"
            ? "شهادة معتمدة"
            : "بدون شهادة"}
        </Badge>
      )}

      {eventHours && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {eventHours} ساعة
        </Badge>
      )}
    </div>
  );
};
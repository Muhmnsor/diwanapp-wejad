
import { formatTotalPeriod } from "../../utils/countdownUtils";

interface CurrentDiscussionInfoProps {
  totalCurrentHours: number;
  remainingDays: number;
  remainingHours: number;
}

export const CurrentDiscussionInfo = ({
  totalCurrentHours,
  remainingDays,
  remainingHours,
}: CurrentDiscussionInfoProps) => {
  const isDiscussionEnded = remainingDays === 0 && remainingHours === 0;
  
  return (
    <div className="p-3 bg-purple-50 rounded-md space-y-2">
      <p className="text-sm font-medium text-purple-800">
        الفترة الكلية الحالية: {formatTotalPeriod(totalCurrentHours)}
      </p>
      
      <p className="text-sm text-purple-700">
        الوقت المتبقي حالياً: {
          isDiscussionEnded ? 
          "المناقشة منتهية" : 
          `${remainingDays > 0 ? `${remainingDays} يوم` : ""}${remainingDays > 0 && remainingHours > 0 ? " و " : ""}${remainingHours > 0 ? `${remainingHours} ساعة` : ""}`
        }
      </p>
    </div>
  );
};

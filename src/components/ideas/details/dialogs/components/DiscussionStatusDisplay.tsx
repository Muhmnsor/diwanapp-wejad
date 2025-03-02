
import React from "react";
import { DiscussionPeriodData } from "../types";

interface DiscussionStatusDisplayProps {
  discussionData: DiscussionPeriodData;
}

export const DiscussionStatusDisplay: React.FC<DiscussionStatusDisplayProps> = ({ discussionData }) => {
  const { totalCurrentHours, remainingDays, remainingHours, discussionEnded } = discussionData;
  
  return (
    <div className="p-3 bg-purple-50 rounded-md space-y-2">
      <p className="text-sm font-medium text-purple-800">
        الفترة الكلية الحالية: {
          discussionEnded ? "المناقشة منتهية" : 
          Math.floor(totalCurrentHours / 24) > 0 ? `${Math.floor(totalCurrentHours / 24)} يوم` : "" 
        } 
        {!discussionEnded && Math.floor(totalCurrentHours / 24) > 0 && totalCurrentHours % 24 > 0 ? " و " : ""}
        {!discussionEnded && totalCurrentHours % 24 > 0 ? `${Math.floor(totalCurrentHours % 24)} ساعة` : ""}
        {totalCurrentHours === 0 && !discussionEnded && "غير محددة"}
      </p>
      
      <p className="text-sm text-purple-700">
        الوقت المتبقي حالياً: {
          discussionEnded ? "المناقشة منتهية" :
          remainingDays > 0 ? `${remainingDays} يوم` : ""
        } 
        {!discussionEnded && remainingDays > 0 && remainingHours > 0 ? " و " : ""}
        {!discussionEnded && remainingHours > 0 ? `${remainingHours} ساعة` : ""}
        {!discussionEnded && remainingDays === 0 && remainingHours === 0 && "أقل من ساعة"}
      </p>
    </div>
  );
};

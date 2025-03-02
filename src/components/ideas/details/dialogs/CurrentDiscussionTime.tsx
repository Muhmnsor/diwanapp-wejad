
interface CurrentDiscussionTimeProps {
  totalCurrentHours: number;
  remainingDays: number;
  remainingHours: number;
}

export const CurrentDiscussionTime = ({
  totalCurrentHours,
  remainingDays,
  remainingHours
}: CurrentDiscussionTimeProps) => {
  return (
    <div className="p-3 bg-purple-50 rounded-md space-y-2">
      <p className="text-sm font-medium text-purple-800">
        الفترة الكلية الحالية: {Math.floor(totalCurrentHours / 24) > 0 ? `${Math.floor(totalCurrentHours / 24)} يوم` : ""} 
        {Math.floor(totalCurrentHours / 24) > 0 && totalCurrentHours % 24 > 0 ? " و " : ""}
        {totalCurrentHours % 24 > 0 ? `${Math.floor(totalCurrentHours % 24)} ساعة` : ""}
        {totalCurrentHours === 0 && "غير محددة"}
      </p>
      
      <p className="text-sm text-purple-700">
        الوقت المتبقي حالياً: {remainingDays > 0 ? `${remainingDays} يوم` : ""} 
        {remainingDays > 0 && remainingHours > 0 ? " و " : ""}
        {remainingHours > 0 ? `${remainingHours} ساعة` : ""}
        {remainingDays === 0 && remainingHours === 0 && "المناقشة منتهية"}
      </p>
    </div>
  );
};

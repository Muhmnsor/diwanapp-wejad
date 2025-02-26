import { useState, useEffect } from "react";
import { intervalToDuration } from "date-fns";

interface IdeaMetadataProps {
  created_by: string;
  created_at: string;
  status: string;
  title: string;
  discussion_period?: string;
}

export const IdeaMetadata = ({ created_by, created_at, status, title, discussion_period }: IdeaMetadataProps) => {
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const discussionDays = parseInt(discussion_period || "0");
        if (isNaN(discussionDays)) return;

        const createdDate = new Date(created_at);
        const discussionEndDate = new Date(createdDate);
        discussionEndDate.setDate(discussionEndDate.getDate() + discussionDays);
        
        const now = new Date().getTime();
        const endTime = discussionEndDate.getTime();
        const distance = endTime - now;

        if (distance > 0) {
          const duration = intervalToDuration({ start: now, end: endTime });
          setCountdown({
            days: duration.days || 0,
            hours: duration.hours || 0,
            minutes: duration.minutes || 0,
            seconds: duration.seconds || 0
          });
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      } catch (error) {
        console.error('Error calculating time left:', error);
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [discussion_period, created_at]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'draft':
        return 'مسودة';
      case 'under_review':
        return 'قيد المراجعة';
      case 'approved':
        return 'تمت الموافقة';
      case 'rejected':
        return 'مرفوضة';
      default:
        return 'مؤرشفة';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-purple-100">
      <div className="flex items-center justify-between gap-4 flex-wrap lg:flex-nowrap">
        <h1 className="text-xl font-bold text-purple-800 min-w-[200px] truncate">{title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
          <div className="flex items-center gap-1">
            <span className="font-medium">بواسطة:</span>
            <span>{created_by}</span>
          </div>
          <span className="text-purple-300">•</span>
          <div className="flex items-center gap-1">
            <span className="font-medium">التاريخ:</span>
            <span>{new Date(created_at).toLocaleDateString('ar-SA')}</span>
          </div>
          {discussion_period && (
            <>
              <span className="text-purple-300">•</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">مدة المناقشة:</span>
                <span>{discussion_period} يوم</span>
              </div>
            </>
          )}
        </div>
        {discussion_period && countdown && (
          <div className="flex items-center gap-2 bg-purple-50 rounded-lg py-1.5 px-2 text-sm flex-shrink-0">
            {countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0 ? (
              <p className="text-red-600 font-medium">انتهت المناقشة</p>
            ) : (
              <>
                <span className="font-medium text-purple-800">متبقي:</span>
                <div className="flex gap-2">
                  <span className="font-bold text-purple-700">{countdown.days}ي</span>
                  <span className="font-bold text-purple-700">{countdown.hours}س</span>
                  <span className="font-bold text-purple-700">{countdown.minutes}د</span>
                  <span className="font-bold text-purple-700">{countdown.seconds}ث</span>
                </div>
              </>
            )}
          </div>
        )}
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 ${getStatusClass(status)}`}>
          {getStatusDisplay(status)}
        </span>
      </div>
    </div>
  );
};

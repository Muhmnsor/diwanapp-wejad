
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
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>بواسطة: {created_by}</span>
              <span>•</span>
              <span>{new Date(created_at).toLocaleDateString('ar-SA')}</span>
              {discussion_period && (
                <>
                  <span>•</span>
                  <span>مدة المناقشة: {discussion_period} يوم</span>
                </>
              )}
            </div>
            {discussion_period && (
              <div className="text-sm">
                {countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0 ? (
                  <p className="text-destructive">انتهت فترة المناقشة</p>
                ) : (
                  <p className="text-primary">
                    متبقي: {countdown.days} يوم {countdown.hours} ساعة {countdown.minutes} دقيقة {countdown.seconds} ثانية
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(status)}`}>
          {getStatusDisplay(status)}
        </span>
      </div>
    </div>
  );
};


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
    <div className="space-y-4 bg-white rounded-lg shadow-sm p-6 border border-purple-100">
      <div className="flex justify-between items-start">
        <div className="space-y-4 flex-1">
          <div>
            <h1 className="text-3xl font-bold text-purple-800 mb-2">{title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold">بواسطة:</span>
                <span>{created_by}</span>
              </div>
              <span className="text-purple-300">•</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">التاريخ:</span>
                <span>{new Date(created_at).toLocaleDateString('ar-SA')}</span>
              </div>
              {discussion_period && (
                <>
                  <span className="text-purple-300">•</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">مدة المناقشة:</span>
                    <span>{discussion_period} يوم</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {discussion_period && countdown && (
            <div className="bg-purple-50 rounded-lg p-4 inline-block">
              {countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0 ? (
                <p className="text-red-600 font-medium">انتهت فترة المناقشة</p>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-purple-800">متبقي:</span>
                  <div className="flex gap-3">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-purple-700">{countdown.days}</span>
                      <p className="text-sm text-purple-600">يوم</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-purple-700">{countdown.hours}</span>
                      <p className="text-sm text-purple-600">ساعة</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-purple-700">{countdown.minutes}</span>
                      <p className="text-sm text-purple-600">دقيقة</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-purple-700">{countdown.seconds}</span>
                      <p className="text-sm text-purple-600">ثانية</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusClass(status)}`}>
          {getStatusDisplay(status)}
        </span>
      </div>
    </div>
  );
};

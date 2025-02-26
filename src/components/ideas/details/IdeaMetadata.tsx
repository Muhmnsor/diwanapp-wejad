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
        // إذا لم تكن هناك فترة مناقشة
        if (!discussion_period) {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        const parts = discussion_period.split(' ');
        let totalHours = 0;

        // حساب إجمالي الساعات من الأيام والساعات
        for (let i = 0; i < parts.length; i++) {
          if (parts[i] === 'days' && i > 0) {
            const days = parseInt(parts[i-1]);
            if (!isNaN(days)) {
              totalHours += days * 24;
            }
          }
          if (parts[i] === 'hours' && i > 0) {
            const hours = parseInt(parts[i-1]);
            if (!isNaN(hours)) {
              totalHours += hours;
            }
          }
        }

        // إذا كانت الفترة صفرية أو غير صالحة
        if (totalHours <= 0) {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        const createdDate = new Date(created_at);
        const discussionEndDate = new Date(createdDate.getTime() + (totalHours * 60 * 60 * 1000));
        const now = new Date();

        const distance = discussionEndDate.getTime() - now.getTime();

        if (distance > 0) {
          const duration = intervalToDuration({ start: now, end: discussionEndDate });
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
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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

  const getCountdownDisplay = () => {
    // إذا لم تكن هناك فترة مناقشة
    if (!discussion_period) {
      return "غير محدد";
    }

    // إذا كانت كل القيم صفرية، نتحقق مما إذا كانت الفترة قد انتهت فعلاً
    if (countdown.days === 0 && countdown.hours === 0 && 
        countdown.minutes === 0 && countdown.seconds === 0) {
      
      const createdDate = new Date(created_at);
      const parts = discussion_period.split(' ');
      let totalHours = 0;
      
      // حساب إجمالي الساعات مرة أخرى للتحقق
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === 'days' && i > 0) {
          const days = parseInt(parts[i-1]);
          if (!isNaN(days)) totalHours += days * 24;
        }
        if (parts[i] === 'hours' && i > 0) {
          const hours = parseInt(parts[i-1]);
          if (!isNaN(hours)) totalHours += hours;
        }
      }

      const discussionEndDate = new Date(createdDate.getTime() + (totalHours * 60 * 60 * 1000));
      const now = new Date();
      
      // إذا لم تنته الفترة بعد، نعرض الوقت المتبقي
      if (now < discussionEndDate) {
        return "أقل من دقيقة";
      }
      
      return "انتهت المناقشة";
    }

    // بناء نص العد التنازلي
    const parts = [];
    if (countdown.days > 0) {
      parts.push(`${countdown.days} يوم`);
    }
    if (countdown.hours > 0) {
      parts.push(`${countdown.hours} ساعة`);
    }
    if (countdown.minutes > 0) {
      parts.push(`${countdown.minutes} دقيقة`);
    }
    if (countdown.seconds > 0) {
      parts.push(`${countdown.seconds} ثانية`);
    }

    return parts.length > 0 ? parts.join(' و ') : "أقل من دقيقة";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-purple-100">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-purple-800 truncate">{title}</h1>
        <div className="flex items-center gap-2 bg-purple-50 rounded-lg py-1.5 px-2 text-sm">
          <span className="font-medium text-purple-800">متبقي:</span>
          <div className="font-bold text-purple-700">
            {getCountdownDisplay()}
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(status)}`}>
          {getStatusDisplay(status)}
        </span>
      </div>
    </div>
  );
};

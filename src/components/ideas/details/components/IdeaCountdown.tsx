
import { useState, useEffect } from "react";
import { calculateTimeRemaining, getCountdownDisplay, CountdownTime } from "../utils/countdownUtils";
import { Button } from "@/components/ui/button";
import { Clock, Edit2 } from "lucide-react";
import { ModifyTimeDialog } from "../dialogs/ModifyTimeDialog";

interface IdeaCountdownProps {
  discussion_period?: string;
  created_at: string;
  ideaId?: string;
}

export const IdeaCountdown = ({ discussion_period, created_at, ideaId }: IdeaCountdownProps) => {
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);
  const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const timeLeft = calculateTimeRemaining(discussion_period, created_at);
      setCountdown(timeLeft);
      
      // التحقق مما إذا كان الوقت منتهي (كل القيم = 0)
      const expired = 
        timeLeft.days === 0 && 
        timeLeft.hours === 0 && 
        timeLeft.minutes === 0 && 
        timeLeft.seconds === 0;
      
      setIsExpired(expired);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // تنفيذ فوري للعملية الحسابية

    return () => clearInterval(timer);
  }, [discussion_period, created_at]);

  const handleOpenModifyDialog = () => {
    setIsModifyDialogOpen(true);
  };

  const handleCloseModifyDialog = () => {
    setIsModifyDialogOpen(false);
  };

  // إذا لم يتم تحديد معرف الفكرة، فلن نعرض زر التعديل
  const showEditButton = ideaId !== undefined;

  if (!discussion_period) {
    return (
      <div className="flex items-center gap-2 bg-purple-50 rounded-lg py-1.5 px-2 text-sm">
        <span className="font-medium text-purple-800">المناقشة:</span>
        <div className="font-bold text-purple-700">غير محددة</div>
        {showEditButton && (
          <Button 
            variant="ghost"
            size="sm"
            className="p-0 h-5 w-5 hover:bg-purple-100"
            onClick={handleOpenModifyDialog}
          >
            <Edit2 className="h-3 w-3 text-purple-700" />
          </Button>
        )}
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 bg-red-50 rounded-lg py-1.5 px-2 text-sm">
        <Clock className="h-4 w-4 text-red-600" />
        <span className="font-medium text-red-800">حالة المناقشة:</span>
        <div className="font-bold text-red-700">انتهت المناقشة</div>
        {showEditButton && (
          <Button 
            variant="ghost"
            size="sm"
            className="p-0 h-5 w-5 hover:bg-red-100"
            onClick={handleOpenModifyDialog}
          >
            <Edit2 className="h-3 w-3 text-red-700" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-purple-50 rounded-lg py-1.5 px-2 text-sm">
      <span className="font-medium text-purple-800">متبقي:</span>
      <div className="font-bold text-purple-700">
        {getCountdownDisplay(discussion_period, created_at, countdown)}
      </div>
      {showEditButton && (
        <Button 
          variant="ghost"
          size="sm"
          className="p-0 h-5 w-5 hover:bg-purple-100"
          onClick={handleOpenModifyDialog}
        >
          <Edit2 className="h-3 w-3 text-purple-700" />
        </Button>
      )}
      {ideaId && (
        <ModifyTimeDialog
          isOpen={isModifyDialogOpen}
          onClose={handleCloseModifyDialog}
          ideaId={ideaId}
          currentPeriod={discussion_period}
        />
      )}
    </div>
  );
};

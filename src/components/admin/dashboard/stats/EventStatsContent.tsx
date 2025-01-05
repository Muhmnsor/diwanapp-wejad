import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Star } from "lucide-react";
import { formatDateWithDay } from "@/utils/dateTimeUtils";
import { RegistrationStatsCard } from "./RegistrationStatsCard";
import { differenceInDays, differenceInHours, parseISO } from "date-fns";

interface EventStatsContentProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
    id: string;
    start_date: string;
    end_date: string;
    event_path: string;
    event_category: string;
    averageRating?: number;
  };
}

export const EventStatsContent = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project
}: EventStatsContentProps) => {
  console.log("EventStatsContent props:", { project });

  const getArabicPath = (path: string) => {
    const pathMap: Record<string, string> = {
      'environment': 'البيئة',
      'community': 'المجتمع',
      'content': 'المحتوى'
    };
    return pathMap[path] || path;
  };

  const getArabicCategory = (category: string) => {
    const categoryMap: Record<string, string> = {
      'social': 'اجتماعي',
      'entertainment': 'ترفيهي',
      'service': 'خدمي',
      'educational': 'تعليمي',
      'consulting': 'استشاري',
      'interest': 'اهتمام',
      'specialization': 'تخصص',
      'spiritual': 'روحي',
      'cultural': 'ثقافي',
      'behavioral': 'سلوكي',
      'skill': 'مهاري',
      'health': 'صحي',
      'diverse': 'متنوع'
    };
    return categoryMap[category] || category;
  };

  const getRemainingTime = (date: string) => {
    try {
      const eventDate = parseISO(date);
      const now = new Date();
      
      if (eventDate < now) {
        return "انتهت الفعالية";
      }

      const daysRemaining = differenceInDays(eventDate, now);
      const hoursRemaining = differenceInHours(eventDate, now) % 24;

      if (daysRemaining > 0) {
        return `متبقي ${daysRemaining} يوم ${hoursRemaining} ساعة`;
      } else if (hoursRemaining > 0) {
        return `متبقي ${hoursRemaining} ساعة`;
      } else {
        return "الفعالية اليوم";
      }
    } catch (error) {
      console.error('Error calculating remaining time:', error);
      return '';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <RegistrationStatsCard
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
      />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            نوع الفعالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getArabicPath(project.event_path)}</div>
          <p className="text-xs text-muted-foreground">
            {getArabicCategory(project.event_category)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">
            موعد الفعالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {project.start_date ? formatDateWithDay(project.start_date) : 'لم يتم تحديد الموعد'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {project.start_date ? getRemainingTime(project.start_date) : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
          <Star className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">
            متوسط التقييم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {project.averageRating ? 
              `${project.averageRating.toFixed(1)} / 5` : 
              'لا يوجد تقييم'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
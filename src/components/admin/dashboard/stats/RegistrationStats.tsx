import { Users } from "lucide-react";
import { StatCard } from "./StatCard";

interface RegistrationStatsProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventPath?: string;
  eventCategory?: string;
}

export const RegistrationStats = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  eventPath,
  eventCategory
}: RegistrationStatsProps) => {
  const formatEventPath = (path?: string) => {
    if (!path) return '';
    const pathMap: Record<string, string> = {
      'environment': 'البيئة',
      'community': 'المجتمع',
      'content': 'المحتوى'
    };
    return pathMap[path] || path;
  };

  const formatEventCategory = (category?: string) => {
    if (!category) return '';
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

  return (
    <>
      <StatCard
        title="إجمالي المسجلين"
        value={registrationCount}
        subtitle={`متبقي ${remainingSeats} مقعد`}
        icon={Users}
      />
      <StatCard
        title="نسبة الإشغال"
        value={`${occupancyRate?.toFixed(1) || 0}%`}
        subtitle={eventPath && eventCategory ? `${formatEventPath(eventPath)} - ${formatEventCategory(eventCategory)}` : undefined}
        icon={Users}
      />
    </>
  );
};
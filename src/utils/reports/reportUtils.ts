
import { ProjectReport } from '@/types/projectReport';

export function formatRating(rating: number | null): string {
  if (rating === null || rating === undefined) return 'لم يتم التقييم';
  return `${rating.toFixed(1)} من 5`;
}

export function getActivityDuration(report: ProjectReport): number {
  if (report.activity) {
    // إذا كان نشاط مشروع
    if (report.activity.activity_duration !== undefined) {
      return report.activity.activity_duration;
    }
    // إذا كان فعالية منفردة
    if (report.activity.event_hours !== undefined) {
      return report.activity.event_hours;
    }
  }
  return 0;
}

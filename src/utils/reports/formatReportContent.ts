import { ProjectReport, ReportPhoto } from '@/types/projectReport';

const formatValue = (value: string | null | undefined): string => {
  if (!value || value.trim() === '') return 'لا يوجد';
  return value;
};

const formatSatisfactionLevel = (level: number | null | undefined): string => {
  if (!level && level !== 0) return 'غير محدد';
  return `${level}/5`;
};

const formatLinks = (links?: string[]): string => {
  if (!links || links.length === 0) return 'لا يوجد روابط';
  return links.join('\n');
};

const formatComments = (comments?: string[]): string => {
  if (!comments || comments.length === 0) return 'لا يوجد تعليقات';
  return comments.join('\n');
};

export const generateReportContent = (report: ProjectReport): string => {
  const sections = [
    {
      title: 'اسم التقرير',
      value: formatValue(report.report_name)
    },
    {
      title: 'اسم البرنامج',
      value: formatValue(report.program_name)
    },
    {
      title: 'الوصف التفصيلي',
      value: formatValue(report.detailed_description)
    },
    {
      title: 'مدة النشاط',
      value: formatValue(report.activity_duration)
    },
    {
      title: 'عدد الحضور',
      value: formatValue(report.attendees_count)
    },
    {
      title: 'أهداف النشاط',
      value: formatValue(report.activity_objectives)
    },
    {
      title: 'الأثر على المشاركين',
      value: formatValue(report.impact_on_participants)
    },
    {
      title: 'نص التقرير',
      value: formatValue(report.report_text)
    },
    {
      title: 'روابط الفيديو',
      value: formatLinks(report.video_links)
    },
    {
      title: 'روابط إضافية',
      value: formatLinks(report.additional_links)
    },
    {
      title: 'تعليقات',
      value: formatComments(report.comments)
    },
    {
      title: 'مستوى الرضا',
      value: formatSatisfactionLevel(report.satisfaction_level)
    }
  ];

  return sections
    .map(section => `${section.title}:\n${section.value}`)
    .join('\n\n');
};
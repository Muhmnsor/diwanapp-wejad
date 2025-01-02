import { ProjectReport } from '@/types/projectReport';

const formatValue = (value: string | null | undefined): string => {
  if (!value || value.trim() === '') return 'لا يوجد';
  return value;
};

export const generateReportContent = (report: ProjectReport): string => {
  const sections = [
    {
      title: 'اسم النشاط',
      value: report.events?.title || 'غير محدد'
    },
    {
      title: 'اسم البرنامج',
      value: formatValue(report.program_name)
    },
    {
      title: 'اسم التقرير',
      value: formatValue(report.report_name)
    },
    {
      title: 'مدة النشاط',
      value: `${formatValue(report.activity_duration)} ساعة`
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
    }
  ];

  // Add a separator line
  const separator = '='.repeat(50);
  
  // Format the content with proper spacing and separators
  return `تقرير النشاط\n${separator}\n\n` + 
    sections
      .map(section => `${section.title}:\n${section.value}\n`)
      .join('\n' + separator + '\n\n');
};
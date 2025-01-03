import { saveAs } from 'file-saver';
import { ProjectReport } from '@/types/projectReport';

export const downloadProjectReport = async (report: ProjectReport): Promise<void> => {
  try {
    // Create a text content for the report
    const reportContent = `
تقرير النشاط
=============

اسم البرنامج: ${report.program_name || ''}
اسم التقرير: ${report.report_name}
تفاصيل التقرير: ${report.report_text}

الأهداف: ${report.activity_objectives || ''}
الأثر على المشاركين: ${report.impact_on_participants || ''}

عدد الحضور: ${report.attendees_count || ''}
مدة النشاط: ${report.activity_duration || ''} ساعات

تاريخ التقرير: ${new Date(report.created_at).toLocaleDateString('ar-SA')}
    `;

    // Create a blob from the content
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    
    // Generate filename
    const filename = `تقرير-${report.report_name}-${new Date().toISOString().split('T')[0]}.txt`;
    
    // Download the file
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error downloading report:', error);
    throw new Error('Failed to download report');
  }
};
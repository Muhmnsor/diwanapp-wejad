
import { ProjectReport } from '@/types/projectReport';
import { formatRating, getActivityDuration } from './reportUtils';
import { parsePhotos } from './photoUtils';
import { photoPlaceholders } from './constants';

export function generateReportText(report: ProjectReport): string {
  console.log('Generating report text for:', report);
  
  const duration = getActivityDuration(report);
  
  let reportText = `
تقرير النشاط
=============

معلومات أساسية:
---------------
اسم البرنامج/المشروع: ${report.program_name || ''}
اسم النشاط: ${report.activity?.title || 'غير محدد'}
اسم المقدم/المنظم: ${report.report_name}
مدة النشاط: ${duration} ساعات
عدد الحضور: ${report.attendees_count || 0}

تفاصيل النشاط:
--------------
${report.report_text || ''}

الأهداف:
-------
${report.objectives || report.activity_objectives || report.activity?.description || ''}

الأثر على المشاركين:
------------------
${report.impact_on_participants || ''}

تقييم النشاط:
-----------
`;

  const activityRatings = report.activity?.averageRatings;
  
  if (activityRatings) {
    reportText += `
عدد المقيمين: ${activityRatings.count}

التقييم العام: ${formatRating(activityRatings.overall_rating)}
تقييم المحتوى: ${formatRating(activityRatings.content_rating)}
تقييم التنظيم: ${formatRating(activityRatings.organization_rating)}
تقييم المقدم: ${formatRating(activityRatings.presenter_rating)}
`;
  } else {
    reportText += 'لم يتم تقييم النشاط بعد\n';
  }

  reportText += `
الصور المرفقة:
------------\n`;

  const parsedPhotos = report.photos ? parsePhotos(report.photos) : [];
  console.log('Parsed photos:', parsedPhotos);

  if (parsedPhotos.length > 0) {
    const sortedPhotos = [...parsedPhotos].sort((a, b) => {
      const indexA = a.index !== undefined ? a.index : Number.MAX_SAFE_INTEGER;
      const indexB = b.index !== undefined ? b.index : Number.MAX_SAFE_INTEGER;
      return indexA - indexB;
    });

    sortedPhotos.forEach((photo) => {
      const description = photo.index !== undefined ? photoPlaceholders[photo.index] : 'صورة إضافية';
      const number = photo.index !== undefined ? photo.index + 1 : sortedPhotos.indexOf(photo) + 1;
      reportText += `${number}. ${description}\n`;
    });
  } else {
    reportText += 'لا توجد صور مرفقة\n';
  }

  if (report.video_links && report.video_links.length > 0) {
    reportText += `
روابط الفيديو:
------------
${report.video_links.join('\n')}
`;
  }

  if (report.additional_links && report.additional_links.length > 0) {
    reportText += `
روابط إضافية:
-----------
${report.additional_links.join('\n')}
`;
  }

  reportText += `
تاريخ التقرير: ${new Date(report.created_at).toLocaleDateString('ar-SA')}
`;

  return reportText;
}

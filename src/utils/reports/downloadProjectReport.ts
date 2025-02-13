
import { saveAs } from 'file-saver';
import { ProjectReport } from '@/types/projectReport';
import JSZip from 'jszip';

async function fetchImageAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${url}`);
  return await response.blob();
}

function getImageFileName(index: number, description: string): string {
  const sanitizedDescription = description
    .replace(/[^\u0621-\u064A0-9\s]/g, '') // Keep Arabic letters, numbers, and spaces
    .trim()
    .replace(/\s+/g, '-');
  return `${(index + 1).toString().padStart(2, '0')}-${sanitizedDescription || 'صورة'}.jpg`;
}

function formatRating(rating: number | null): string {
  if (rating === null) return 'لم يتم التقييم';
  return `${rating} من 5`;
}

function generateReportText(report: ProjectReport): string {
  const activityRating = report.activity?.activity_feedback?.[0];
  
  let reportText = `
تقرير النشاط
=============

معلومات أساسية:
---------------
اسم البرنامج/المشروع: ${report.program_name || ''}
اسم المقدم/المنظم: ${report.report_name}
مدة النشاط: ${report.activity_duration} ساعات
عدد الحضور: ${report.attendees_count || 0}

تفاصيل النشاط:
--------------
${report.report_text || ''}

الأهداف:
-------
${report.activity_objectives || ''}

الأثر على المشاركين:
------------------
${report.impact_on_participants || ''}

تقييم النشاط:
-----------
`;

  if (activityRating) {
    reportText += `
التقييم العام: ${formatRating(activityRating.overall_rating)}
تقييم المحتوى: ${formatRating(activityRating.content_rating)}
تقييم التنظيم: ${formatRating(activityRating.organization_rating)}
تقييم المقدم: ${formatRating(activityRating.presenter_rating)}
`;
  } else {
    reportText += 'لم يتم تقييم النشاط بعد\n';
  }

  reportText += `
الصور المرفقة:
------------\n`;

  if (report.photos && report.photos.length > 0) {
    report.photos.forEach((photo, index) => {
      if (photo && photo.url) {
        reportText += `${index + 1}. ${photo.description || 'صورة بدون وصف'}\n`;
      }
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

export const downloadProjectReport = async (report: ProjectReport): Promise<void> => {
  try {
    const zip = new JSZip();
    
    // Add report text file
    const reportContent = generateReportText(report);
    zip.file('التقرير.txt', reportContent);
    
    // Create images folder
    const imagesFolder = zip.folder('الصور');
    
    // Add images if they exist
    if (report.photos && report.photos.length > 0) {
      const imagePromises = report.photos.map(async (photo, index) => {
        if (photo && photo.url) {
          try {
            const imageBlob = await fetchImageAsBlob(photo.url);
            const fileName = getImageFileName(index, photo.description || '');
            imagesFolder.file(fileName, imageBlob);
          } catch (error) {
            console.error(`Failed to fetch image ${index + 1}:`, error);
          }
        }
      });
      
      await Promise.all(imagePromises);
    }
    
    // Generate zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Generate filename based on report name and date
    const date = new Date().toISOString().split('T')[0];
    const filename = `تقرير-${report.report_name}-${date}.zip`;
    
    // Download the zip file
    saveAs(zipBlob, filename);
  } catch (error) {
    console.error('Error downloading report:', error);
    throw new Error('Failed to download report');
  }
};

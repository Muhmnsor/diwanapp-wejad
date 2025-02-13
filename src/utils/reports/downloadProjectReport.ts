
import { saveAs } from 'file-saver';
import { ProjectReport } from '@/types/projectReport';
import JSZip from 'jszip';

async function fetchImageAsBlob(url: string): Promise<Blob> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${url}`);
    return await response.blob();
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

function getImageFileName(index: number, description: string): string {
  const sanitizedDescription = description
    .replace(/[^\u0621-\u064A0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${(index + 1).toString().padStart(2, '0')}-${sanitizedDescription || 'صورة'}.jpg`;
}

function formatRating(rating: number | null): string {
  if (rating === null || rating === undefined) return 'لم يتم التقييم';
  return `${rating} من 5`;
}

function generateReportText(report: ProjectReport): string {
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

  if (report.activity?.activity_feedback && report.activity.activity_feedback.length > 0) {
    const feedback = report.activity.activity_feedback[0];
    reportText += `
التقييم العام: ${formatRating(feedback.overall_rating)}
تقييم المحتوى: ${formatRating(feedback.content_rating)}
تقييم التنظيم: ${formatRating(feedback.organization_rating)}
تقييم المقدم: ${formatRating(feedback.presenter_rating)}
`;
  } else {
    reportText += 'لم يتم تقييم النشاط بعد\n';
  }

  reportText += `
الصور المرفقة:
------------
`;

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
    
    // Add report text file with UTF-8 encoding
    const reportContent = generateReportText(report);
    const textEncoder = new TextEncoder();
    const encodedContent = textEncoder.encode(reportContent);
    zip.file('التقرير.txt', encodedContent, { binary: true });
    
    // Create images folder
    const imagesFolder = zip.folder('الصور');
    if (!imagesFolder) {
      throw new Error('Failed to create images folder in zip');
    }
    
    // Add images if they exist
    if (report.photos && report.photos.length > 0) {
      console.log('Processing photos:', report.photos);
      
      // Process images sequentially to avoid overwhelming the server
      for (let i = 0; i < report.photos.length; i++) {
        const photo = report.photos[i];
        if (photo && photo.url) {
          try {
            console.log(`Fetching image ${i + 1}:`, photo.url);
            const imageBlob = await fetchImageAsBlob(photo.url);
            const fileName = getImageFileName(i, photo.description || '');
            console.log(`Adding image to zip: ${fileName}`);
            imagesFolder.file(fileName, imageBlob, { binary: true });
          } catch (error) {
            console.error(`Failed to fetch image ${i + 1}:`, error);
          }
        }
      }
    }
    
    // Generate zip file
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
    
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

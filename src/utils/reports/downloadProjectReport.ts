
import { saveAs } from 'file-saver';
import { ProjectReport } from '@/types/projectReport';
import JSZip from 'jszip';

async function fetchImageAsBlob(url: string): Promise<Blob> {
  try {
    console.log('Fetching image:', url);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${url}`);
    const blob = await response.blob();
    console.log('Image fetched successfully, size:', blob.size);
    return blob;
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

function parsePhotos(photos: any[]): { url: string; description: string }[] {
  return photos.map(photo => {
    if (typeof photo === 'string') {
      try {
        return JSON.parse(photo);
      } catch (e) {
        console.error('Error parsing photo:', e);
        return null;
      }
    }
    return photo;
  }).filter(Boolean);
}

function formatRating(rating: number | null): string {
  if (rating === null || rating === undefined) return 'لم يتم التقييم';
  return `${rating} من 5`;
}

const getAttendeesCount = (attendeesCount: any): number => {
  try {
    if (!attendeesCount) return 0;
    if (typeof attendeesCount === 'number') return attendeesCount;
    if (typeof attendeesCount === 'string') {
      if (attendeesCount.includes('[object Object]')) {
        // إذا كانت القيمة سلسلة من الكائنات، نقوم بحساب عدد المرات التي تظهر فيها
        const count = (attendeesCount.match(/\[object Object\]/g) || []).length;
        return count;
      }
      const parsed = parseInt(attendeesCount);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  } catch (error) {
    console.error('Error parsing attendees count:', error);
    return 0;
  }
};

function generateReportText(report: ProjectReport): string {
  let reportText = `
تقرير النشاط
=============

معلومات أساسية:
---------------
اسم البرنامج/المشروع: ${report.program_name || ''}
اسم المقدم/المنظم: ${report.report_name}
مدة النشاط: ${report.activity_duration} ساعات
عدد الحضور: ${getAttendeesCount(report.attendees_count)}

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

  const parsedPhotos = report.photos ? parsePhotos(report.photos) : [];
  
  reportText += `
الصور المرفقة:
------------
`;

  if (parsedPhotos.length > 0) {
    parsedPhotos.forEach((photo, index) => {
      reportText += `${index + 1}. ${photo.description || 'صورة بدون وصف'}\n`;
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
    console.log('Starting report download, photos:', report.photos);
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
      const parsedPhotos = parsePhotos(report.photos);
      console.log('Processing parsed photos:', parsedPhotos);
      
      // Process images sequentially
      for (let i = 0; i < parsedPhotos.length; i++) {
        const photo = parsedPhotos[i];
        if (photo && photo.url) {
          try {
            console.log(`Processing image ${i + 1}:`, photo);
            const imageBlob = await fetchImageAsBlob(photo.url);
            const fileName = getImageFileName(i, photo.description || '');
            console.log(`Adding image to zip: ${fileName}`);
            imagesFolder.file(fileName, imageBlob, { binary: true });
          } catch (error) {
            console.error(`Failed to process image ${i + 1}:`, error);
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

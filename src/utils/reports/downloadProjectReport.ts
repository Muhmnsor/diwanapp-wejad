
import { saveAs } from 'file-saver';
import { ProjectReport } from '@/types/projectReport';
import JSZip from 'jszip';

async function fetchImageAsBlob(url: string): Promise<Blob> {
  try {
    console.log('Attempting to fetch image from:', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch image:', response.statusText);
      throw new Error(`Failed to fetch image: ${url} (${response.status})`);
    }
    const blob = await response.blob();
    console.log('Successfully fetched image, size:', blob.size);
    return blob;
  } catch (error) {
    console.error('Error in fetchImageAsBlob:', error);
    throw error;
  }
}

function getImageFileName(index: number, description: string): string {
  const sanitizedDescription = description
    .replace(/[^\u0621-\u064A0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 50); // تقييد طول اسم الملف
  return `${(index + 1).toString().padStart(2, '0')}-${sanitizedDescription || 'صورة'}.jpg`;
}

function formatRating(rating: number | null): string {
  if (rating === null || rating === undefined) return 'لم يتم التقييم';
  return `${rating.toFixed(1)} من 5`;
}

function generateReportText(report: ProjectReport): string {
  console.log('Generating report text for:', report);
  const activityRating = report.events?.activity_feedback?.[0];
  
  let reportText = `
تقرير النشاط
=============

معلومات أساسية:
---------------
اسم البرنامج/المشروع: ${report.program_name || ''}
اسم المقدم/المنظم: ${report.report_name}
${report.author_name ? `معد التقرير: ${report.author_name}` : ''}
مدة النشاط: ${report.activity_duration} ساعات
عدد الحضور: ${report.attendees_count || 0}
اسم النشاط: ${report.events?.title || 'غير محدد'}

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
    console.log('Adding ratings to report:', activityRating);
    reportText += `
التقييم العام: ${formatRating(activityRating.overall_rating)}
تقييم المحتوى: ${formatRating(activityRating.content_rating)}
تقييم التنظيم: ${formatRating(activityRating.organization_rating)}
تقييم المقدم: ${formatRating(activityRating.presenter_rating)}
`;
  } else {
    console.log('No ratings found for report');
    reportText += 'لم يتم تقييم النشاط بعد\n';
  }

  reportText += `
الصور المرفقة:
------------\n`;

  if (report.photos && report.photos.length > 0) {
    const validPhotos = report.photos.filter(photo => photo && photo.url && photo.description);
    console.log('Valid photos count:', validPhotos.length);
    if (validPhotos.length > 0) {
      validPhotos.forEach((photo, index) => {
        reportText += `${index + 1}. ${photo.description || 'صورة بدون وصف'}\n`;
      });
    } else {
      reportText += 'لا توجد صور مرفقة\n';
    }
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
    console.log('Starting report download process for:', report.report_name);
    const zip = new JSZip();
    
    // Add report text file
    const reportContent = generateReportText(report);
    zip.file('التقرير.txt', reportContent);
    console.log('Added report text to zip');
    
    // Create images folder
    const imagesFolder = zip.folder('الصور');
    if (!imagesFolder) {
      throw new Error('Failed to create images folder in zip');
    }
    
    // Add images if they exist
    if (report.photos && report.photos.length > 0) {
      console.log('Processing photos:', report.photos.length, 'photos found');
      
      const validPhotos = report.photos.filter(photo => photo && photo.url);
      console.log('Valid photos to process:', validPhotos.length);

      const imagePromises = validPhotos.map(async (photo, index) => {
        if (photo && photo.url) {
          try {
            console.log(`Processing image ${index + 1}:`, photo.url);
            const imageBlob = await fetchImageAsBlob(photo.url);
            const fileName = getImageFileName(index, photo.description || '');
            console.log('Adding image to zip:', fileName, 'size:', imageBlob.size);
            imagesFolder.file(fileName, imageBlob);
          } catch (error) {
            console.error(`Failed to process image ${index + 1}:`, error);
            // Continue with other images even if one fails
          }
        }
      });
      
      await Promise.all(imagePromises);
      console.log('Finished processing all images');
    } else {
      console.log('No photos found in report');
    }
    
    // Generate zip file
    console.log('Generating final zip file');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Generate filename based on report name and date
    const date = new Date().toISOString().split('T')[0];
    const filename = `تقرير-${report.report_name}-${date}.zip`;
    
    // Download the zip file
    console.log('Initiating download of:', filename);
    saveAs(zipBlob, filename);
    console.log('Download initiated successfully');
  } catch (error) {
    console.error('Error in downloadProjectReport:', error);
    throw new Error('Failed to download report: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

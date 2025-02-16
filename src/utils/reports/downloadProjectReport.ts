import { saveAs } from 'file-saver';
import { ProjectReport, ReportPhoto } from '@/types/projectReport';
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
    .substring(0, 50);
  return `${(index + 1).toString().padStart(2, '0')}-${sanitizedDescription || 'صورة'}.jpg`;
}

function formatRating(rating: number | null): string {
  if (rating === null || rating === undefined) return 'لم يتم التقييم';
  return `${rating.toFixed(1)} من 5`;
}

function calculateAverageRatings(feedback: any[]) {
  if (!feedback || feedback.length === 0) return null;

  const validRatings = feedback.reduce((acc, f) => {
    if (f.overall_rating) acc.overall.push(f.overall_rating);
    if (f.content_rating) acc.content.push(f.content_rating);
    if (f.organization_rating) acc.organization.push(f.organization_rating);
    if (f.presenter_rating) acc.presenter.push(f.presenter_rating);
    return acc;
  }, { overall: [], content: [], organization: [], presenter: [] });

  const calculateAverage = (arr: number[]) => 
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  return {
    overall_rating: calculateAverage(validRatings.overall),
    content_rating: calculateAverage(validRatings.content),
    organization_rating: calculateAverage(validRatings.organization),
    presenter_rating: calculateAverage(validRatings.presenter),
    count: feedback.length
  };
}

function parsePhotos(photos: any[]): ReportPhoto[] {
  return photos.map(photo => {
    if (typeof photo === 'string') {
      try {
        return JSON.parse(photo);
      } catch (e) {
        console.error('Error parsing photo JSON:', e);
        return null;
      }
    }
    return photo;
  }).filter(Boolean);
}

function generateReportText(report: ProjectReport): string {
  console.log('Generating report text for:', report);
  
  let reportText = `
تقرير النشاط
=============

معلومات أساسية:
---------------
اسم البرنامج/المشروع: ${report.program_name || ''}
اسم المقدم/المنظم: ${report.report_name}
مدة النشاط: ${report.activity_duration} ساعات
عدد الحضور: ${report.attendees_count || 0}
اسم النشاط: ${report.activity?.title || 'غير محدد'}

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

  console.log('Activity feedback:', report.activity?.activity_feedback);
  
  const feedback = report.activity?.activity_feedback;
  console.log('Raw feedback:', feedback);

  if (feedback && feedback.length > 0) {
    const calculatedRatings = calculateAverageRatings(feedback);
    console.log('Calculated ratings:', calculatedRatings);

    reportText += `
عدد المقيمين: ${calculatedRatings.count}

التقييم العام: ${formatRating(calculatedRatings.overall_rating)}
تقييم المحتوى: ${formatRating(calculatedRatings.content_rating)}
تقييم التنظيم: ${formatRating(calculatedRatings.organization_rating)}
تقييم المقدم: ${formatRating(calculatedRatings.presenter_rating)}
`;
  } else {
    console.log('No ratings found');
    reportText += 'لم يتم تقييم النشاط بعد\n';
  }

  reportText += `
الصور المرفقة:
------------\n`;

  const parsedPhotos = report.photos ? parsePhotos(report.photos) : [];
  console.log('Parsed photos:', parsedPhotos);

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
    
    // Parse and add images if they exist
    if (report.photos && report.photos.length > 0) {
      console.log('Processing photos:', report.photos.length, 'photos found');
      
      const parsedPhotos = parsePhotos(report.photos);
      console.log('Valid photos to process:', parsedPhotos.length);

      const imagePromises = parsedPhotos.map(async (photo, index) => {
        if (photo && photo.url) {
          try {
            console.log(`Processing image ${index + 1}:`, photo.url);
            const imageBlob = await fetchImageAsBlob(photo.url);
            const fileName = getImageFileName(index, photo.description || '');
            console.log('Adding image to zip:', fileName, 'size:', imageBlob.size);
            imagesFolder.file(fileName, imageBlob);
          } catch (error) {
            console.error(`Failed to process image ${index + 1}:`, error);
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

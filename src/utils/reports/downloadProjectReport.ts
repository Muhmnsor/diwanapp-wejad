
import { saveAs } from 'file-saver';
import { ProjectReport, ReportPhoto } from '@/types/projectReport';
import JSZip from 'jszip';

const photoPlaceholders = [
  "صورة المقدم وخلفه الشاشة او مايدل على النشاط",
  "تفاعل المقدم مع المستفيدين",
  "الضيافة ان وجدت قبل استهلاكها",
  "تفاعل المستفيدين او الجمهور",
  "صورة جماعية",
  "صورة فردية لمستفيد متفاعل"
];

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

function getImageFileName(photo: ReportPhoto): string {
  const description = photo.index !== undefined ? photoPlaceholders[photo.index] : 'صورة إضافية';
  const sanitizedDescription = description
    .replace(/[^\u0621-\u064A0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 50);
  return `${(photo.index !== undefined ? photo.index + 1 : 0).toString().padStart(2, '0')}-${sanitizedDescription}.jpg`;
}

function formatRating(rating: number | null): string {
  if (rating === null || rating === undefined) return 'لم يتم التقييم';
  return `${rating.toFixed(1)} من 5`;
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

function getActivityDuration(report: ProjectReport): number {
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

function generateReportText(report: ProjectReport): string {
  console.log('Generating report text for:', report);
  
  const duration = getActivityDuration(report);
  
  let reportText = `
تقرير النشاط
=============

معلومات أساسية:
---------------
اسم البرنامج/المشروع: ${report.program_name || ''}
اسم المقدم/المنظم: ${report.report_name}
مدة النشاط: ${duration} ساعات
عدد الحضور: ${report.attendees_count || 0}
اسم النشاط: ${report.activity?.title || 'غير محدد'}

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

export const downloadProjectReport = async (report: ProjectReport): Promise<void> => {
  try {
    console.log('Starting report download process for:', report);
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

      const sortedPhotos = [...parsedPhotos].sort((a, b) => {
        const indexA = a.index !== undefined ? a.index : Number.MAX_SAFE_INTEGER;
        const indexB = b.index !== undefined ? b.index : Number.MAX_SAFE_INTEGER;
        return indexA - indexB;
      });

      const imagePromises = sortedPhotos.map(async (photo) => {
        if (photo && photo.url) {
          try {
            console.log(`Processing image with index ${photo.index}:`, photo.url);
            const imageBlob = await fetchImageAsBlob(photo.url);
            const fileName = getImageFileName(photo);
            console.log('Adding image to zip:', fileName, 'size:', imageBlob.size);
            imagesFolder.file(fileName, imageBlob);
          } catch (error) {
            console.error(`Failed to process image:`, error);
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
    
    // Generate filename based on activity title and date
    const date = new Date().toISOString().split('T')[0];
    const activityTitle = report.activity?.title || 'نشاط';
    const filename = `تقرير-${activityTitle}-${date}.zip`;
    
    // Download the zip file
    console.log('Initiating download of:', filename);
    saveAs(zipBlob, filename);
    console.log('Download initiated successfully');
  } catch (error) {
    console.error('Error in downloadProjectReport:', error);
    throw new Error('Failed to download report: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

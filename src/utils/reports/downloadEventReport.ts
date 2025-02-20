
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { fetchImageAsBlob, getImageFileName, parsePhotos } from './photoUtils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const downloadEventReport = async (report: any): Promise<void> => {
  try {
    console.log('Starting event report download process for:', report);
    const zip = new JSZip();
    
    // إنشاء محتوى التقرير
    const reportContent = generateEventReportText(report);
    zip.file('التقرير.txt', reportContent);
    console.log('Added report text to zip');
    
    // إنشاء مجلد للصور
    const imagesFolder = zip.folder('الصور');
    if (!imagesFolder) {
      throw new Error('Failed to create images folder in zip');
    }
    
    // معالجة وإضافة الصور إذا وجدت
    if (report.photos && report.photos.length > 0) {
      console.log('Processing photos:', report.photos.length, 'photos found');
      
      const parsedPhotos = parsePhotos(report.photos);
      console.log('Valid photos to process:', parsedPhotos.length);

      const imagePromises = parsedPhotos.map(async (photo, index) => {
        if (photo && photo.url) {
          try {
            console.log('Processing image:', photo.url);
            const imageBlob = await fetchImageAsBlob(photo.url);
            const fileName = getImageFileName({ ...photo, index });
            console.log('Adding image to zip:', fileName);
            imagesFolder.file(fileName, imageBlob);
          } catch (error) {
            console.error('Failed to process image:', error);
          }
        }
      });
      
      await Promise.all(imagePromises);
      console.log('Finished processing all images');
    }
    
    // إنشاء الملف المضغوط
    console.log('Generating final zip file');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // تحديد اسم الملف بناءً على عنوان الفعالية والتاريخ
    const date = format(new Date(), 'yyyy-MM-dd', { locale: ar });
    const eventTitle = report.events?.title || 'فعالية';
    const filename = `تقرير-${eventTitle}-${date}.zip`;
    
    // تنزيل الملف المضغوط
    console.log('Initiating download of:', filename);
    saveAs(zipBlob, filename);
    console.log('Download initiated successfully');
  } catch (error) {
    console.error('Error in downloadEventReport:', error);
    throw error;
  }
};

function generateEventReportText(report: any): string {
  let reportText = `
تقرير الفعالية
=============

معلومات أساسية:
---------------
اسم الفعالية: ${report.events?.title || 'غير محدد'}
اسم التقرير: ${report.report_name || ''}
معد التقرير: ${report.profiles?.email || 'غير محدد'}
مدة الفعالية: ${report.events?.event_hours || 0} ساعات
عدد الحضور: ${report.attendees_count || 0}
عدد الغياب: ${report.absent_count || 0}

نص التقرير:
----------
${report.report_text || ''}

الأهداف:
-------
${report.objectives || ''}

الأثر على المشاركين:
------------------
${report.impact_on_participants || ''}

تقييم الفعالية:
-----------
مستوى الرضا: ${report.satisfaction_level || 0} من 5
`;

  if (report.partners) {
    reportText += `
الشركاء:
-------
${report.partners}
`;
  }

  if (report.links && report.links.length > 0) {
    reportText += `
روابط مفيدة:
----------
${report.links.join('\n')}
`;
  }

  reportText += `
الصور المرفقة:
------------
`;

  const photos = parsePhotos(report.photos || []);
  if (photos.length > 0) {
    photos.forEach((photo, index) => {
      if (photo.description) {
        reportText += `${index + 1}. ${photo.description}\n`;
      } else {
        reportText += `${index + 1}. صورة ${index + 1}\n`;
      }
    });
  } else {
    reportText += 'لا توجد صور مرفقة\n';
  }

  reportText += `
تاريخ التقرير: ${format(new Date(report.created_at), 'dd/MM/yyyy', { locale: ar })}
`;

  return reportText;
}
